/*KONFIGURASI*/
// Mengambil gambar dari folder 'images' kamu
const backgrounds = ["images/bg1.png", "images/bg2.png", "images/bg3.png"];

const city = "Jonggol";
const country = "Indonesia";

/*1. JAM & TANGGAL */
function updateDateTime() {
  const now = new Date();

  // Jam Digital
  document.getElementById("clock").innerText = now
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(/\./g, " : ");

  // Tanggal Masehi
  const dateMasehi = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Tanggal Hijriah
  const hijriDate = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  document.getElementById(
    "date"
  ).innerHTML = `${dateMasehi}<br><em>${hijriDate} H</em>`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

/*  2. BACKGROUND SLIDESHOW*/
let bgIndex = 0;
const container = document.querySelector(".container");

function changeBackground() {
  // Memastikan path gambar benar
  container.style.backgroundImage = `url('${backgrounds[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % backgrounds.length;
}
setInterval(changeBackground, 10000); // Ganti tiap 10 detik
changeBackground();

/* =====================
   3. JADWAL SHOLAT (API)
====================== */
async function loadPrayerTimes() {
  try {
    const now = new Date();
    const dateStr = `${now.getDate()}-${
      now.getMonth() + 1
    }-${now.getFullYear()}`;

    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${city}&country=${country}&method=20`
    );
    const data = await response.json();
    const t = data.data.timings;

    // Tampilkan Jadwal
    const jadwal = {
      subuh: t.Fajr,
      syuruq: t.Sunrise,
      dzuhur: t.Dhuhr,
      asar: t.Asr,
      maghrib: t.Maghrib,
      isya: t.Isha,
    };

    for (let key in jadwal) {
      document.getElementById(key).innerText = jadwal[key];
    }

    startNextPrayerCountdown(t);
    highlightCurrentPrayer(jadwal); // Fitur highlight aktif
  } catch (error) {
    console.error("Gagal koneksi:", error);
  }
}
loadPrayerTimes();

/* =====================
   4. COUNTDOWN SHOLAT
====================== */
function startNextPrayerCountdown(timings) {
  function updateCountdown() {
    const now = new Date();
    const prayers = [
      { name: "Subuh", time: timings.Fajr },
      { name: "Syuruq", time: timings.Sunrise },
      { name: "Dzuhur", time: timings.Dhuhr },
      { name: "Ashar", time: timings.Asr },
      { name: "Maghrib", time: timings.Maghrib },
      { name: "Isya", time: timings.Isha },
    ];

    let target = null;
    let targetTime = null;

    for (let p of prayers) {
      const [h, m] = p.time.split(":");
      const pTime = new Date();
      pTime.setHours(h, m, 0, 0);
      if (pTime > now) {
        target = p.name;
        targetTime = pTime;
        break;
      }
    }

    if (!target) {
      target = "Subuh";
      const [h, m] = timings.Fajr.split(":");
      targetTime = new Date();
      targetTime.setDate(targetTime.getDate() + 1);
      targetTime.setHours(h, m, 0, 0);
    }

    const diff = targetTime - now;
    const hLeft = Math.floor(diff / 3600000);
    const mLeft = Math.floor((diff % 3600000) / 60000);
    const sLeft = Math.floor((diff % 60000) / 1000);

    document.getElementById("nextPrayerName").innerText = target;
    document.getElementById("nextPrayerCountdown").innerText = `${String(
      hLeft
    ).padStart(2, "0")} : ${String(mLeft).padStart(2, "0")} : ${String(
      sLeft
    ).padStart(2, "0")}`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

/* =====================
   5. HIGHLIGHT WAKTU AKTIF
====================== */
function highlightCurrentPrayer(jadwal) {
  const now = new Date();
  // Hapus kelas aktif sebelumnya
  document
    .querySelectorAll(".prayer, .prayer-satu, .prayer-dua")
    .forEach((el) => el.classList.remove("active-prayer"));

  // Logika sederhana: Cari waktu yg paling dekat yang SUDAH lewat
  let current = null;
  const timeMap = {
    subuh: jadwal.subuh,
    syuruq: jadwal.syuruq,
    dzuhur: jadwal.dzuhur,
    asar: jadwal.asar,
    maghrib: jadwal.maghrib,
    isya: jadwal.isya,
  };

  for (let key in timeMap) {
    const [h, m] = timeMap[key].split(":");
    const pTime = new Date();
    pTime.setHours(h, m, 0, 0);

    if (now >= pTime) {
      current = key;
    }
  }

  // Jika ada waktu aktif, tambahkan class highlight
  if (current) {
    const el = document.getElementById(current);
    if (el) {
      // Naik 2 level ke parent (div class="prayer...")
      el.parentElement.parentElement.classList.add("active-prayer");
    }
  }
}

/* =====================
   6. COUNTDOWN RAMADHAN
====================== */
function updateRamadhan() {
  const ramadhanDate = new Date("2026-03-18");
  const now = new Date();
  const diff = ramadhanDate - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const textEl = document.getElementById("ramadhanCountdown");
  if (days > 0) textEl.innerText = `${days} Hari Menuju Bulan Suci Ramadhan`;
  else textEl.innerText = "Ramadhan Telah Tiba!";
}
updateRamadhan();
