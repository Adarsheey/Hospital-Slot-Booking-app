// Example doctor list
const doctors = {
  Cardiology: ["Dr. A", "Dr. B"],
  Dermatology: ["Dr. C"],
  Neurology: ["Dr. D", "Dr. E"]
};

// Google Apps Script URL
const scriptURL = "https://script.google.com/macros/s/AKfycbzSqEhUtb4rJRa76rgu7lNlP5oAstX39SoXafxuPKjia8l5clXDJjBH4DWCs23uvpHY/exec";

// Slot timings
const slots = ["9:00-10:00", "11:00-12:00", "2:00-3:00", "4:00-5:00"];

// Populate doctors on specialisation change
document.getElementById("specialisation").addEventListener("change", function () {
  const spec = this.value;
  const doctorSelect = document.getElementById("doctor");
  doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>';

  if (doctors[spec]) {
    doctors[spec].forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc;
      opt.textContent = doc;
      doctorSelect.appendChild(opt);
    });
  }
});

// Populate slots when doctor is selected
document.getElementById("doctor").addEventListener("change", function () {
  const slotDiv = document.getElementById("slots");
  slotDiv.innerHTML = "";
  slots.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s;
    btn.className = "slot-btn";
    btn.onclick = () => selectSlot(s);
    slotDiv.appendChild(btn);
  });
});

let selectedSlot = null;
function selectSlot(slot) {
  selectedSlot = slot;
  document.querySelectorAll(".slot-btn").forEach(btn => btn.classList.remove("selected"));
  document.querySelectorAll(".slot-btn").forEach(btn => {
    if (btn.textContent === slot) btn.classList.add("selected");
  });
}

// Book button
document.getElementById("bookBtn").addEventListener("click", async () => {
  const patientName = document.getElementById("patientName").value;
  const specialisation = document.getElementById("specialisation").value;
  const doctor = document.getElementById("doctor").value;

  if (!patientName || !specialisation || !doctor || !selectedSlot) {
    alert("Please fill all fields and select a slot.");
    return;
  }

  const bookingData = {
    patientName,
    specialisation,
    doctor,
    slot: selectedSlot
  };

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    if (result.status === "success") {
      const confirmation = `
        ✅ Booking Confirmed!<br>
        
        <b>Patient:</b> ${patientName}<br>
        <b>Doctor:</b> ${doctor}<br>
        <b>Specialisation:</b> ${specialisation}<br>
        <b>Slot:</b> ${selectedSlot}
      `;
     // <b>Token No:</b> ${result.token}<br>
      document.getElementById("confirmation").innerHTML = confirmation;

      // Generate PDF receipt
      generatePDF(result.token, patientName, doctor, specialisation, selectedSlot);
    } else {
      alert("Booking failed. Try again.");
    }
  } catch (err) {
    console.error("Error!", err);
    alert("Error while booking.");
  }
});

// Simple PDF generator
function generatePDF(token, patientName, doctor, specialisation, slot) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("---Hospital Booking Receipt---", 20, 20);
  doc.setFontSize(12); // doc.text(`Token No: ${token}`, 20, 40);
  doc.text(`Patient Name: ${patientName}`, 20, 50);
  doc.text(`Doctor: ${doctor}`, 20, 60);
  doc.text(`Specialisation: ${specialisation}`, 20, 70);
  doc.text(`Slot: ${slot}`, 20, 80);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);
  doc.text(`---Thank you for booking online---`,20,100);
  doc.save(`Booking_Slot.pdf`);
  
}
