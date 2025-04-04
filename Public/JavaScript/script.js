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
      false
    );
  });
})();

setTimeout(function () {
  let alert = document.getElementById("success-alert");
  if (alert) {
    let fadeEffect = setInterval(() => {
      if (!alert.style.opacity) {
        alert.style.opacity = 1;
      }
      if (alert.style.opacity > 0) {
        alert.style.opacity -= 0.1;
      } else {
        clearInterval(fadeEffect);
        alert.remove(); // Remove from DOM
      }
    }, 50);
  }
}, 3000);

const gstToggle = document.getElementById("switchCheckDefault");
  const gstNotes = document.querySelectorAll(".gst-note");

  gstToggle.addEventListener("change", function () {
    gstNotes.forEach((note) => {
      note.style.display = this.checked ? "inline" : "none";
    });
  });
