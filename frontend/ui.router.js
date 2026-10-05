function switchPage(pageId) {
    console.log("switching to:", pageId);

    document.querySelectorAll(".page")
        .forEach(p => p.classList.remove("active"));

    document.getElementById(pageId)
        .classList.add("active");

    const isAuthPage =
        pageId === "page-login" ||
        pageId === "page-register";

    document.getElementById("main-banner").style.display =
        isAuthPage ? "block" : "none";

    document.getElementById("universal-nav").style.display =
        isAuthPage ? "none" : "flex";
}

document.addEventListener("DOMContentLoaded", () => {

    // 登入/註冊頁切換
    document.getElementById("go-register")
        .addEventListener("click", () => switchPage("page-register"));

    document.getElementById("go-login")
        .addEventListener("click", () => switchPage("page-login"));

    // 角色切換
    // =================================================================
    // [Use Case 2] Register Member: 處理註冊時的角色切換與表單欄位顯示
    // =================================================================
    // [Use Case 2 主流程 2] 動作者選擇會員角色 (提供者)
    document.getElementById("btn-provider")
        .addEventListener("click", () => {
            AuthController.setRole("provider");
            document.getElementById("btn-provider").classList.add("active");
            document.getElementById("btn-recipient").classList.remove("active");
            // [Use Case 2 主流程 3] 系統根據角色顯示對應註冊欄位 (顯示提供者欄位)
            document.getElementById("provider-fields").style.display = "block";
            document.getElementById("recipient-fields").style.display = "none";
        });

    // [Use Case 2 主流程 2] 動作者選擇會員角色 (領取者
    document.getElementById("btn-recipient")
        .addEventListener("click", () => {
            AuthController.setRole("recipient");
            document.getElementById("btn-recipient").classList.add("active");
            document.getElementById("btn-provider").classList.remove("active");
            // [Use Case 2 主流程 3] 系統根據角色顯示對應註冊欄位 (顯示領取者欄位)
            document.getElementById("recipient-fields").style.display = "block";
            document.getElementById("provider-fields").style.display = "none";
        });

    // 頁面導航
    document.getElementById("go-add-food")
    .addEventListener("click", () => {
        document.getElementById("add-product-form").reset();
        document.getElementById("add-final-price").value = "";
        switchPage("page-provider-add");
    });

    document.getElementById("back-to-provider-home")
        .addEventListener("click", () => switchPage("page-provider-home"));

    document.getElementById("back-to-provider-home-2")
        .addEventListener("click", () => switchPage("page-provider-home"));

    document.getElementById("back-to-browse")
        .addEventListener("click", () => switchPage("page-recipient-browse"));

    document.getElementById("logout-btn")
        .addEventListener("click", AuthController.logout);
});