document.addEventListener("DOMContentLoaded", loadOrders);

// ✅ Fetch and display orders
async function loadOrders() {
    try {
       const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend

let response = await fetch(`${API_BASE_URL}/api/orders`); // ✅ Updated API URL
let orders = await response.json();


        if (!response.ok) throw new Error("❌ Failed to fetch orders.");

        const orderList = document.getElementById("order-list");
        orderList.innerHTML = ""; // ✅ Clear old data

        if (orders.length === 0) {
            orderList.innerHTML = "<tr><td colspan='7'>❌ No orders found!</td></tr>";
            return;
        }

        orders.forEach(order => {
            let row = document.createElement("tr");

            row.innerHTML = `
                <td>${order.fullname}</td>
                <td>${order.gcash}</td>
                <td>${order.address}</td>
                <td>${formatItems(order.items)}</td>
                <td>₱${parseFloat(order.total).toFixed(2)}</td>
<td>
    <img src="https://vdeck.onrender.com${order.paymentProof}" width="200" height="200" alt="Payment Proof" 
         onerror="this.src='placeholder.jpg'">
</td>

                <td>
                    <button class="delete-btn" data-id="${order._id}">🗑 Delete</button>
                </td>
            `;

            orderList.appendChild(row);
        });

        // ✅ Add event listeners for delete buttons
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", deleteOrder);
        });

    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        document.getElementById("order-list").innerHTML = `<tr><td colspan='7'>❌ Server error. Try again later.</td></tr>`;
    }
}

// ✅ Format items correctly
function formatItems(items) {
    try {
        let parsedItems = typeof items === "string" ? JSON.parse(items) : items;
        return parsedItems.map(item => `${item.name} (x${item.quantity})`).join(", ");
    } catch (error) {
        console.error("❌ Error parsing items:", error);
        return "❌ Invalid item data";
    }
}

// ✅ Delete an order
async function deleteOrder(event) {
    const orderId = event.target.dataset.id;
    if (!confirm("❌ Are you sure you want to delete this order?")) return;

    try {
        const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend

let response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, { // ✅ Updated API URL
    method: "DELETE",
});


        let result = await response.json();

        if (!response.ok) throw new Error(result.error || "❌ Failed to delete order.");

        alert("✅ Order deleted successfully!");
        loadOrders(); // ✅ Reload orders after deleting
    } catch (error) {
        console.error("❌ Error deleting order:", error);
        alert("❌ Failed to delete order.");
    }
}
