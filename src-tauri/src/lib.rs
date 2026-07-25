//! 暗核工坊 Tauri 后端：包含 Windows 桌面全屏抓取与像素物理弯曲采样 IPC
use tauri::{Manager, WebviewWindow};

pub mod commands {
    use super::*;

    #[tauri::command]
    pub fn capture_desktop_under_window(
        window: WebviewWindow,
        width: i32,
        height: i32,
        is_dragging: Option<bool>,
    ) -> Result<String, String> {
        #[cfg(target_os = "windows")]
        {
            use windows_sys::Win32::Graphics::Gdi::{
                BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC,
                GetDIBits, ReleaseDC, SelectObject, BITMAPINFO, BITMAPINFOHEADER, BI_RGB,
                DIB_RGB_COLORS, SRCCOPY,
            };
            use windows_sys::Win32::UI::WindowsAndMessaging::{
                GetWindowLongPtrW, GetWindowRect, SetLayeredWindowAttributes, SetWindowLongPtrW,
                GWL_EXSTYLE, LWA_ALPHA, WS_EX_LAYERED,
            };

            unsafe {
                let raw_hwnd = window.hwnd().map_err(|e| e.to_string())?.0;
                let hwnd = raw_hwnd as windows_sys::Win32::Foundation::HWND;

                let mut rect = std::mem::zeroed();
                GetWindowRect(hwnd, &mut rect);

                let win_w = rect.right - rect.left;
                let win_h = rect.bottom - rect.top;

                let x = rect.left + (win_w - width) / 2;
                let y = rect.top + (win_h - height) / 2;
                let w = width;
                let h = height;

                let dragging = is_dragging.unwrap_or(false);

                // 🌟【防闪烁与静止高精双模采样】：
                // 1. 拖拽移动过程中 (dragging = true)：绝对不切换 Layered Alpha！
                //    保持 100% 透明度常态，彻底消灭移动过程中的图形闪烁与闪屏现象；
                // 2. 静止/松手状态 (dragging = false)：执行 0.01ms 瞬时 Alpha 穿透采样，精确捕获新位置正下方桌面！
                if !dragging {
                    let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE) as u32;
                    if (ex_style & WS_EX_LAYERED) == 0 {
                        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, (ex_style | WS_EX_LAYERED) as isize);
                    }
                    SetLayeredWindowAttributes(hwnd, 0, 0, LWA_ALPHA);
                }

                let hdc_screen = GetDC(std::ptr::null_mut());
                let hdc_mem = CreateCompatibleDC(hdc_screen);
                let hbmp = CreateCompatibleBitmap(hdc_screen, w, h);
                let old_bmp = SelectObject(hdc_mem, hbmp as *mut _);

                BitBlt(hdc_mem, 0, 0, w, h, hdc_screen, x, y, SRCCOPY);

                if !dragging {
                    SetLayeredWindowAttributes(hwnd, 0, 255, LWA_ALPHA);
                }

                let mut bmi: BITMAPINFO = std::mem::zeroed();
                bmi.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
                bmi.bmiHeader.biWidth = w;
                bmi.bmiHeader.biHeight = -h; // Top-down
                bmi.bmiHeader.biPlanes = 1;
                bmi.bmiHeader.biBitCount = 32;
                bmi.bmiHeader.biCompression = BI_RGB;

                let mut buffer = vec![0u8; (w * h * 4) as usize];
                GetDIBits(
                    hdc_mem,
                    hbmp,
                    0,
                    h as u32,
                    buffer.as_mut_ptr() as *mut _,
                    &mut bmi,
                    DIB_RGB_COLORS,
                );

                SelectObject(hdc_mem, old_bmp);
                DeleteObject(hbmp as *mut _);
                DeleteDC(hdc_mem);
                ReleaseDC(std::ptr::null_mut(), hdc_screen);

                // BGRA 转 RGBA
                for chunk in buffer.chunks_exact_mut(4) {
                    chunk.swap(0, 2);
                }

                use base64::Engine;
                let b64 = base64::engine::general_purpose::STANDARD.encode(&buffer);
                Ok(b64)
            }
        }
        #[cfg(not(target_os = "windows"))]
        {
            let _ = window;
            let _ = width;
            let _ = height;
            Err("仅 Windows 支持底层桌面捕获".into())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(xm_core::single_instance_plugin())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            xm_core::setup_standard(app, "暗核工坊", xm_core::WindowSize::Mini)?;

            if let Some(win) = app.get_webview_window("main") {
                if let Ok(icon) = tauri::image::Image::from_bytes(include_bytes!("../icons/icon.png")) {
                    let _ = win.set_icon(icon);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::capture_desktop_under_window,
            xm_core::sso::read_sso_session,
            xm_core::sso::write_sso_session,
            xm_core::sso::clear_sso_session,
            xm_core::sso::list_sso_accounts,
            xm_core::sso::switch_sso_account,
            xm_core::sso::get_device_fingerprint_cmd,
            xm_core::remote_control::get_local_ips,
        ])
        .run(tauri::generate_context!())
        .expect("启动 暗核工坊 失败");
}
