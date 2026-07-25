fn main() {
    // 自动触发 Tauri 权限装配引擎，确保无论是使用 pnpm dev 还是直接 tauri dev/cargo build，权限都能自动装配
    let _ = std::process::Command::new("node")
        .args(&[
            "../../../scripts/launch/capabilities.mjs",
            "..",
        ])
        .status();

    tauri_build::build();
}
