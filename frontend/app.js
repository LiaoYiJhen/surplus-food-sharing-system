const BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {

    console.log("app loaded");

    // =================================================================
    // [Use Case 1] Login System: 處理動作者點擊登入按鈕的事件
    // =================================================================
    // [Use Case 1 前置條件] 動作者已開啟系統的登入介面
    // =========================
    // LOGIN BUTTON BINDING
    // =========================
    const loginForm = document.getElementById("login-form");

    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        console.log("login clicked");

        // [Use Case 1 主流程 1 & 2] 動作者輸入帳號與密碼，並點擊登入按鈕
        const account = document.getElementById("login-account").value;
        const password = document.getElementById("login-password").value;

        console.log("account:", account);
        console.log("password:", password);

        // 將輸入的資料傳遞給 AuthController 執行後續的驗證流程 (主流程 3)
        AuthController.login(account, password);
    });

    // =================================================================
    // [Use Case 2] Register Member: 處理動作者點擊送出註冊按鈕的事件
    // =================================================================
    // [Use Case 2 前置條件] 動作者已進入系統的註冊頁面
    // =========================
    // REGISTER BUTTON BINDING
    // =========================
    const registerForm = document.getElementById("register-form");

    registerForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        // [Use Case 2 主流程 4 & 5] 動作者輸入註冊資料，並點擊送出註冊按鈕
        // 依據畫面上選擇的角色 (role)，打包對應的註冊欄位資料
        const payload = {
            account: document.getElementById("reg-account").value,
            password: document.getElementById("reg-password").value,
            role: AuthController.getRole()
        };

        if (payload.role === "provider") {
            payload.store_name = document.getElementById("reg-storeName").value;
            payload.address = document.getElementById("reg-address").value;
        } else {
            payload.name = document.getElementById("reg-name").value;
        }

        // 將打包好的註冊資料傳遞給 AuthController 執行後續的驗證流程 (主流程 6)
        AuthController.register(payload);
    });

});