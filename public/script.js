document.addEventListener("DOMContentLoaded", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
            enableHighAccuracy: true
        });
    } else {
        console.log("المتصفح لا يدعم تحديد الموقع");
    }
});

function sendLocation(position) {
    const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
    };

    fetch("https://your-server.com/submit-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => console.log("تم الإرسال:", data))
      .catch(error => console.error("خطأ:", error));
}

function handleError(error) {
    console.error("حدث خطأ أثناء تحديد الموقع:", error);
}