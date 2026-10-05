const AuthController = (() => {

    let role = "provider";

    function setRole(r) {
        role = r;
    }

    async function login(account, password) {
        // [Use Case 1 主流程 1 & 2 後續] 將輸入的帳號密碼發送給後端驗證
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account, password })
        });

        const data = await res.json();

        // [Use Case 1 主流程 3] 接收系統驗證結果
        if (data.success) {
            // [Use Case 1 後置條件] 系統記錄登入狀態
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name || "");

            // 更新 navbar 名稱
            document.getElementById("user-display-name").innerText = `${data.name}，您好！`;

            // [Use Case 1 主流程 4] 系統完成登入並導向對應頁面
            // use Case 5前置條件：領取者已登入系統
            // use Case 6前置條件：領取者已登入系統
            if (data.role === "provider") {
                ProviderController.fetchMyFoods();
                switchPage("page-provider-home");
            } else {
                //useCase 5 主流程一：領取者進入剩食查詢頁面。
                //useCase 6 主流程一：領取者進到剩食查詢頁面。
                switchPage("page-recipient-browse");
                
                //useCase 5 主流程二：Include:: 開啟定位
                //useCase 6 主流程二：系統顯示 GPS 定位請求視窗
                document.getElementById("location-modal-layer").style.display = "flex";
                RecipientController.startLocationSearch();
            }
        } else {
            // [Use Case 1 替代流程 3a] 帳號不存在或密碼錯誤：系統顯示錯誤訊息
            alert("帳號不存在或密碼錯誤，請重新輸入！");
        }
    }

    // 註冊資料驗證
    async function register(payload) {
        // [Use Case 2 主流程 4 & 5 後續] 準備驗證動作者輸入的註冊資料
        const phoneRegex = /^09\d{8}$/;
        
        const addressRegex = /[縣市區鄉鎮村里路街道巷弄號樓]/;

        // [Use Case 2 主流程 6] 系統驗證資料格式正確
        const isValid =
            phoneRegex.test(payload.account) &&
            payload.password &&
            (payload.role === "provider"
                ? payload.store_name?.trim() && 
                payload.address?.trim() && 
                addressRegex.test(payload.address)
                : payload.name?.trim());

        if (!isValid) {
            // [Use Case 2 替代流程 6a] 格式錯誤：系統顯示錯誤訊息
            alert("格式錯誤或帳號已存在，請重新輸入！");
            return;
        }

        // 發送至後端執行主流程 7
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            // [Use Case 2 主流程 8] 系統完成註冊並導向登入頁面
            alert("註冊成功");
            switchPage("page-login");
        } else {
            // [Use Case 2 替代流程 6a] 帳號已存在：系統顯示錯誤訊息
            alert("格式錯誤或帳號已存在，請重新輸入！");
        }
    }

    function logout() {
        localStorage.clear();
        switchPage("page-login");
    }

    function getRole() {
        return role;
    }

    return {
        login,
        register,
        logout,
        setRole,
        getRole
    };

})();