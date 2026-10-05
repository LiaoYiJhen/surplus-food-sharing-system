const ProviderController = (() => {

    async function fetchMyFoods() {
        const res = await fetch(`${BASE_URL}/food/my`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await res.json();
        const container = document.getElementById("provider-food-list-container");

        container.innerHTML = "";

        let index = 0;
        data.data.forEach(food => {
            index++;
            console.log(`#${index}:`, food.food_name);
            const card = document.createElement("div");
            card.className = "product-card";
            card.onclick = () => {
                document.getElementById("up-id").value = food.food_id;
                document.getElementById("up-name").value = food.food_name;
                document.getElementById("up-price").value = food.original_price;
                document.getElementById("up-discount").value = food.discount;
                document.getElementById("up-final-price").value = Math.round(food.original_price * food.discount);
                document.getElementById("up-qty").value = food.quantity;
                switchPage("page-provider-update");
            };
            card.innerHTML = `
                <div>#${index}</div>
                <div>
                    <div class="p-name">${food.food_name}</div>
                    <div class="p-store">售價 $${Math.round(food.original_price * food.discount)} | 剩 ${food.quantity} 個</div>
                </div>
                <span>編輯 ➔</span>
            `;
            container.appendChild(card);
        });
    }

    async function addFood(payload) {
        const res = await fetch(`${BASE_URL}/food`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            alert("新增成功");
            fetchMyFoods();
            switchPage("page-provider-home");
        } else {
            alert("新增失敗，請再試一次");
        }
    }

    async function updateQuantity(id, quantity) {
        await fetch(`${BASE_URL}/food/${id}/quantity`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ quantity })
        });

        fetchMyFoods();
        switchPage("page-provider-home");
    }

    return {
        fetchMyFoods,
        addFood,
        updateQuantity
    };

})();

document.addEventListener("DOMContentLoaded", () => {
    // 自動計算折扣後售價
    function calcFinalPrice() {
        const price = parseFloat(document.getElementById("add-original-price").value);
        const discount = parseFloat(document.getElementById("add-discount").value);
        if (!isNaN(price) && !isNaN(discount)) {
            document.getElementById("add-final-price").value = Math.round(price * discount);
        } else {
            document.getElementById("add-final-price").value = "";
        }
    }

    // 監聽輸入事件以自動計算折扣後售價
    document.getElementById("add-original-price")
        .addEventListener("input", calcFinalPrice);

    document.getElementById("add-discount")
        .addEventListener("input", calcFinalPrice);

    document.getElementById("update-product-form")
        .addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("up-id").value;
            const quantity = parseInt(document.getElementById("up-qty").value);
            await ProviderController.updateQuantity(id, quantity);
        });

    document.getElementById("add-product-form")
        .addEventListener("submit", async (e) => {
            e.preventDefault();

            const food_name = document.getElementById("add-food-name").value.trim();
            const original_price = parseFloat(document.getElementById("add-original-price").value);
            const discount = parseFloat(document.getElementById("add-discount").value);
            const quantity = parseInt(document.getElementById("add-quantity").value);

            if (!food_name) {
                alert("欄位未填寫或格式錯誤，請重新輸入！");
                return;
            }

            const payload = { food_name, original_price, discount, quantity };
            await ProviderController.addFood(payload);
        });
});