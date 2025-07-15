// ------------------ NOTTIFICATION 

export function showNotification(message) {
  const el = document.getElementById("custom-notification");
  el.textContent = message;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 3000);
}