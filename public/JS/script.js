// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".auto-dismiss").forEach((alert) => {
      const delay = alert.classList.contains("alert-danger") ? 5000 : 3000;

      setTimeout(() => {
        if (!alert.isConnected) return;

        alert.classList.remove("show");

        setTimeout(() => {
          if (alert.isConnected && window.bootstrap) {
            window.bootstrap.Alert.getOrCreateInstance(alert).close();
          }
        }, 400);
      }, delay);
    });
  });
})();
