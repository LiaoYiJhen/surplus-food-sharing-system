const RecipientController = (() => {

    let userLocation = null;

    async function searchNearby(lat, lng) {
        //將經緯度送往後端，呼叫searchService的/nearby API
        const res = await fetch(
            `${BASE_URL}/search/nearby?lat=${lat}&lng=${lng}`
        );

        const data = await res.json();
        console.log('搜尋結果:', data);

        const container = document.getElementById("food-list-container");
        container.innerHTML = "";
        // use Case 5 替代流程4a：系統查無符合條件的剩食
        if (!data.success || !data.data || data.data.length === 0) {
            //顯示附近目前沒有剩食
            container.innerHTML = '<p style="text-align:center; color:#888;">附近目前沒有剩食</p>';
            return;
        }
        //use case5 主流程五：系統顯示提供者資訊及剩食資料(剩食名稱/提供者名稱/剩餘數量/距離)
        data.data.forEach(food => {
            const div = document.createElement("div");
            div.className = "product-card";
            div.onclick = () => showDetail(food);
            div.innerHTML = `
                <div class="product-img-placeholder">
                    <span class="distance-label">距離</span>
                    <span class="distance-value">${food.distance_km}</span>
                    <span class="distance-unit">km</span>
                </div>
                <div class="product-info">
                    <div class="p-row">
                        <span class="p-name">${food.food_name}</span>
                        <span class="p-price">$${Math.round(food.final_price)}</span>
                    </div>
                    <div class="p-row">
                        <span class="p-store">${food.store_name}</span>
                        <span class="p-qty">剩 ${food.quantity} 個</span>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }
    // use case5主流程三：系統取得裝置定位資訊
    function startLocationSearch() {
        //use case6主流程三：瀏覽器跳出定位權限請求
        //use case6主流程四：領取者選擇是否允許
        navigator.geolocation.getCurrentPosition(
            // use case6主流程五：領取者點擊允許
            async (pos) => {
                // use case5 主流程四：系統根據定位搜尋符合條件的附近剩食
                //use case6 主流程六：系統取得定位資訊並搜尋附近剩食
                userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                
                await searchNearby(userLocation.lat, userLocation.lng);
                document.getElementById("location-modal-layer").style.display = "none";
            },
            // use Case 5 替代流程 2a：未開啟定位
            // use Case 5 替代流程 2a.1：系統無法取得裝置定位
            // use Case 6 替代流程 4a.1：點擊不允許
            () => {
                // use Case 6 替代流程 4a.2：系統無法取得定位資訊
                document.getElementById("location-modal-layer").style.display = "none";
                //use Case 5 替代流程 2a.2：顯示請允許定位才能查看附近剩食
                document.getElementById("food-list-container").innerHTML =
                    '<p style="text-align:center; color:#888;">請允許定位才能查看附近剩食</p>';
            }
        );
    }

    function showDetail(food) {
        const discountPrice = Math.round(food.original_price * food.discount);

        document.getElementById("detail-name").innerText = food.food_name;
        document.getElementById("detail-store").innerText = food.store_name;
        document.getElementById("detail-address").innerText = `領取地址：${food.address}`;
        document.getElementById("detail-price").innerText = `$${discountPrice}`;
        document.getElementById("detail-qty").innerText = `剩 ${food.quantity} 個`;
        document.getElementById("detail-desc").innerHTML = `
            <ul style="margin-top:12px; padding-left:20px; line-height:1.8; color:#666; font-size:12px;">
                <li>原價 $${food.original_price}，惜食優惠價只要 $${discountPrice}</li>
                <li>數量有限，先到先得！</li>
                <li>請於今日打烊前前往店家領取並付款</li>
            </ul>
        `;
        switchPage("page-recipient-detail");
    }

    return {
        startLocationSearch,
        searchNearby,
        showDetail
    };

})();