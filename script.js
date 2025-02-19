var screen = document.querySelector("#screen");
var btns = document.querySelectorAll(".btn");
var historyList = document.querySelector("#historyList");

// Event listeners for calculator buttons
for (let item of btns) {
  item.addEventListener("click", (e) => {
    let btntext = e.target.innerText;

    if (btntext === "%") {
      if (screen.value !== "" && screen.value !== "Error") {
        // Kalkulasi persen (misalnya 50 -> 0.5)
        const result = parseFloat(screen.value) / 100;
        screen.value = result.toString();
        addToHistory(`${screen.value}%`, result);
      }
      return;
    }

    // Ubah simbol operasi pada layar
    if (btntext === "×") {
      btntext = "x"; // This will change "×" to "x" when the button is clicked.
    }

    if (btntext === "÷") {
      btntext = ":";
    }

    if (btntext === "!") {
      fact(); // Menangani tombol "!"
      return;
    }

    // Handle pi and e separately
    if (btntext === "π") {
      pi();
      return;
    }

    if (btntext === "e") {
      console.log("Tombol e diklik!"); // Cek apakah ini tampil di console
      insertE(); // Memasukkan nilai 'e' ke layar kalkulator
      return;
    }
    

    // Add text to screen
    screen.value += btntext;

    // Memformat angka dengan pemisah ribuan
    formatScreenValue(); // Pastikan format setiap kali tombol ditekan

    if (screen.value.includes("x*")) {
      screen.value = screen.value.replace("x*", "x");
    }

    if (screen.value.includes(":/")) {
      screen.value = screen.value.replace(":/", ":");
    }
  });
}

// Event listener for keyboard input
document.addEventListener("keydown", (e) => {
  const key = e.key;

  // Pastikan event untuk tombol "e" bekerja dengan benar
  if (key === "e") {
    e.preventDefault(); // Menghentikan perilaku default
    insertE(); // Use the renamed function
    return;
  }

  if (key === "!") {
    e.preventDefault();
    fact(); // Call factorial function
    return;
  }

  if (key === "*") {
    e.preventDefault(); // Mencegah perilaku default (default dari '*')
    // Ganti '*' dengan 'x'
    if (screen.value.endsWith("*")) {
      screen.value = screen.value.slice(0, -1) + "x"; // Ganti karakter terakhir
    } else if (screen.value) {
      screen.value += "x"; // Tambahkan 'x' di layar
    }
  }

  if (key === "/") {
    e.preventDefault(); // Mencegah perilaku default (default dari '/')
    // Ganti '/' dengan ':'
    if (screen.value.endsWith("/")) {
      screen.value = screen.value.slice(0, -1) + ":"; // Ganti karakter terakhir
    } else if (screen.value) {
      screen.value += ":"; // Tambahkan ':' di layar
    }
  }

  // Kondisi lainnya untuk tombol-tombol kalkulator lainnya
  if (/[0-9+\-*/.^]/.test(key)) {
    if (key === "^") {
      const base = screen.value; // Simpan nilai basis dari layar
      screen.value += "^"; // Tambahkan simbol pangkat di layar

      document.addEventListener(
        "keydown",
        function exponentInput(e) {
          if (/[0-9]/.test(e.key)) {
            const exponent = e.key;
            screen.value += exponent; // Tambahkan eksponen di layar
            const result = Math.pow(parseFloat(base), parseFloat(exponent));
            const expression = `${base}^${exponent}`;
            addToHistory(expression, result); // Tambahkan ekspresi asli ke riwayat
            screen.value = result;

            // Format hasil hasil eksponen dengan titik ribuan
            formatScreenValue(); // Pastikan hasil diformat dengan pemisah ribuan

            document.removeEventListener("keydown", exponentInput); // Hapus event listener setelah menangkap eksponen
          }
        },
        { once: true }
      );
    } else {
      screen.value += key;
    }

    // Pastikan pemisah ribuan diterapkan saat menambah karakter ke layar
    formatScreenValue();
  }

  if (key === "Enter") {
    evaluateExpression();
    e.preventDefault();
  }
  if (key === "Backspace") {
    backspc();
    e.preventDefault();
    return;
  }

  if (key === "Delete") {
    screen.value = ""; // Hapus semua karakter jika tombol Delete ditekan
    formatScreenValue();
    return;
  }

  // Tangani fungsi trigonometri tanpa langsung menghitungnya
  if (key === "s") {
    triggerTrigonometricFunction("sin");
  }
  if (key === "c") {
    triggerTrigonometricFunction("cos");
  }
  if (key === "t") {
    triggerTrigonometricFunction("tan");
  }

  if (key === "p") {
    pi();
  }

  if (key === "l") {
    log();
  }

  if (key === "a") {
    sqrt();
  }

  if (key === "%") {
    if (screen.value !== "" && screen.value !== "Error") {
      const result = parseFloat(screen.value) / 100;
      screen.value = result.toString();
      addToHistory(`${screen.value}%`, result);
    }
  }

  if (key === "(") {
    screen.value += "(";
  }

  if (key === ")") {
    screen.value += ")";
  }
  if (screen.value.includes("x*")) {
    screen.value = screen.value.replace("x*", "x");
  }

  if (screen.value.includes(":/")) {
    screen.value = screen.value.replace(":/", ":");
  }
});

// Function to trigger trigonometric functions and wait for number input
function triggerTrigonometricFunction(func) {
  // Just add the function name to the screen, but not yet calculate
  screen.value += func + "(";
}

function evaluateTrigonometricFunction(func) {
  const angleInput = screen.value.slice(
    screen.value.indexOf("(") + 1,
    screen.value.indexOf(")")
  );
  const angle = parseFloat(angleInput);

  if (isNaN(angle)) {
    alert("Invalid input. Please enter a valid number.");
    return;
  }

  let result;
  switch (func) {
    case "sin":
      result = Math.sin(angle);
      break;
    case "cos":
      result = Math.cos(angle);
      break;
    case "tan":
      result = Math.tan(angle);
      break;
  }

  // Tambahkan hasil ke riwayat
  addToHistory(`${func}(${angle})`, result);

  // Menampilkan hasil pada layar kalkulator
  screen.value = formatNumber(result);
}

function evaluateExpression() {
  try {
    if (screen.value.trim() === "") {
      screen.value = "Kesalahan"; // Tampilkan pesan error jika ekspresi kosong
      return;
    }

    // Pastikan menangani trigonometri jika ada
    if (
      screen.value.includes("sin(") ||
      screen.value.includes("cos(") ||
      screen.value.includes("tan(")
    ) {
      if (screen.value.includes("sin(")) {
        evaluateTrigonometricFunction("sin");
      } else if (screen.value.includes("cos(")) {
        evaluateTrigonometricFunction("cos");
      } else if (screen.value.includes("tan(")) {
        evaluateTrigonometricFunction("tan");
      }
      return;
    }

    // Ganti 'x' dengan '*' hanya untuk evaluasi
    let expression = screen.value.replace(/x/g, "*").replace(/:/g, "/");

    // Ganti π dan e dengan nilai asli untuk evaluasi
    expression = expression.replace(/π/g, Math.PI);
    expression = expression.replace(/e/g, Math.E);

    // Evaluasi ekspresi matematika
    const result = eval(expression);
    addToHistory(screen.value, result); // Simpan ekspresi yang benar (pakai x untuk history)
    screen.value = formatNumber(result);
  } catch (error) {
    screen.value = "Kesalahan"; // Tampilkan error jika ada masalah dalam perhitungan
  }
}

function loadHistoryFromStorage() {
  const history = localStorage.getItem("calculatorHistory");
  if (history) {
    historyList.innerHTML = history;
    // Perbaiki jika ada simbol yang salah dalam riwayat
    let allEntries = historyList.querySelectorAll("li");
    allEntries.forEach((entry) => {
      entry.innerText = entry.innerText.replace(/×/g, "x").replace(/÷/g, ":"); // Ubah kembali jika ada
    });
  }
}

// Save history to localStorage
function saveHistoryToStorage() {
  localStorage.setItem("calculatorHistory", historyList.innerHTML);
}

// Load history on page load
loadHistoryFromStorage();

function addToHistory(expression, result) {
  const historyEntry = document.createElement("li");

  // Pastikan simbol yang tersimpan adalah x untuk perkalian dan : untuk pembagian
  // dan hindari masalah akar yang ditambahkan pada history
  const sanitizedExpression = expression
    .replace(/\*/g, "x")
    .replace(/\//g, ":")
    .replace(/√/g, "√");
  historyEntry.innerText = `${sanitizedExpression} = ${result}`;
  historyList.appendChild(historyEntry);

  // Simpan history ke localStorage
  saveHistoryToStorage();

  // Scroll ke bawah history setelah menambahkan item baru
  historyList.scrollTop = historyList.scrollHeight;
}

// Fungsi untuk menghapus history
function clearHistory() {
  historyList.innerHTML = "";
  localStorage.removeItem("calculatorHistory"); // Hapus history dari localStorage
}

// Calculator functions
function sin() {
  triggerTrigonometricFunction("sin");
}

function cos() {
  triggerTrigonometricFunction("cos");
}

function tan() {
  triggerTrigonometricFunction("tan");
}

function powXY() {
  const base = parseFloat(screen.value); // Get the base value from the screen
  screen.value += "^"; // Add power symbol to the screen
  const exponent = prompt("Enter the exponent (y):"); // Ask the user to input the exponent

  if (isNaN(exponent)) {
    alert("Invalid input. Please enter numbers.");
    return;
  }

  const result = Math.pow(base, parseFloat(exponent)); // Calculate the result
  const expression = `${base}^${exponent}`; // Create original expression
  addToHistory(expression, result); // Add to history
  screen.value = result; // Update the screen with the result
}

function sqrt() {
  const expression = `√(${screen.value})`;
  const result = Math.sqrt(parseFloat(screen.value.replace(/\./g, "")));
  addToHistory(expression, result);
  screen.value = formatNumber(result);
}

function log() {
  const expression = `log(${screen.value})`;
  const result = Math.log(parseFloat(screen.value.replace(/\./g, "")));
  addToHistory(expression, result);
  screen.value = formatNumber(result);
}

function pi() {
  const piValue = Math.PI;
  const screenValue = screen.value.replace(/\./g, ""); // Hapus pemisah ribuan
  const lastNumber = parseFloat(screenValue.split(/[\+\-\*\/]/).pop());

  if (!isNaN(lastNumber)) {
    const result = lastNumber * piValue;
    screen.value = screenValue.replace(new RegExp(lastNumber + "$"), result);
    addToHistory(`${lastNumber} * π`, result); // Tambahkan ke riwayat
  } else {
    screen.value += piValue;
    addToHistory("π", piValue); // Tambahkan ke riwayat
  }
}

function insertE() {
  const eValue = Math.E; // Nilai Euler (e)
  const screenValue = screen.value.replace(/\./g, ""); // Menghapus pemisah ribuan
  const lastNumber = parseFloat(screenValue.split(/[\+\-\*\/]/).pop()); // Ambil angka terakhir

  let result;

  if (!isNaN(lastNumber)) {
    result = lastNumber * eValue; // Hitung hasil perkalian dengan e
    screen.value = screenValue.replace(new RegExp(lastNumber + "$"), result); // Ganti angka terakhir dengan hasil
  } else {
    result = eValue; // Jika tidak ada angka sebelumnya, langsung set hasilnya menjadi e
    screen.value += eValue; // Tambahkan e ke layar
  }

  // Format ekspresi seperti "3 * e"
  const expression = `${lastNumber} * e`;
  
  // Tambahkan ekspresi dan hasil ke riwayat
  addToHistory(expression, result);

  // Memformat hasil dengan pemisah ribuan
  formatScreenValue();
}



function fact() {
  const num = parseInt(screen.value.replace(/\./g, ""));
  if (isNaN(num) || num < 0) {
    alert("Invalid input for factorial. Enter a non-negative integer.");
    return;
  }

  const expression = `${num}!`;
  let result = 1;
  for (let i = 1; i <= num; i++) {
    result *= i;
  }
  addToHistory(expression, result);
  screen.value = formatNumber(result);
}

// Modify backspc() function to handle formatting correctly
function backspc() {
  let currentValue = screen.value.replace(/\./g, ""); // Remove thousand separators temporarily

  // Check if the last character is part of a function or symbol
  const specialChars = ["e", "π", "+", "-", "*", "/", "^", "%", "(", ")", "√"];
  const functions = ["sin", "cos", "tan", "log", "sqrt"];
  let matchedFunction = "";

  for (const func of functions) {
    if (currentValue.endsWith(func)) {
      matchedFunction = func;
      break;
    }
  }

  // If a function is matched, remove it
  if (matchedFunction) {
    screen.value = currentValue.slice(0, -matchedFunction.length);
  } else if (specialChars.includes(currentValue.slice(-1))) {
    screen.value = currentValue.slice(0, -1); // Remove last special character
  } else {
    screen.value = currentValue.slice(0, -1); // General case: remove last character
  }

  // Reapply the thousand separators after modification
  formatScreenValue(); // Ensure proper formatting after backspace
}

// Function to format the screen value properly (with thousand separators).
function formatScreenValue() {
  screen.value = formatNumber(screen.value.replace(/\./g, "")); // Hapus titik ribuan sebelum pemformatan
}

// Function to format numbers with thousand separators (dots).
function formatNumber(num) {
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(".");
}
function toggleHistory() {
  var history = document.querySelector('.history');
  var toggleButton = document.getElementById('toggleHistory');
  
  // Jika history tersembunyi, tampilkan dan ubah tombol teks menjadi "Hide History"
  if (history.style.display === 'none' || history.style.display === '') {
    history.style.display = 'block';
   
  } else {
    history.style.display = 'none';

  }
}