paypal.Buttons({
    createOrder: function(data, actions) {
        return fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productPrice: document.querySelector('p').textContent.split('$')[1] // Extract price
            })
        }).then(function(res) {
            return res.json();
        }).then(function(data) {
            return data.orderID; // Return order ID to PayPal
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('Payment Successful! Thank you for your purchase.');
            window.location.href = '/success';
        });
    },
    onError: function(err) {
        alert('An error occurred. Please try again.');
    }
}).render('#paypal-button-container');
