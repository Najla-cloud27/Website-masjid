/*BAGIAN KONFIGURASI*/
// daftar gambar background yang ada di folder images
const backgrounds = ["images/bg1.png", "images/bg2.png", "images/bg3.png"];

// lokasi yang dipakai buat ambil jadwal sholat dari API
const city = "Jonggol";
const country = "Indonesia";

/* 1. JAM & TANGGAL */
function updateDateTime() {
  const now = new Date();

  // update jam digital realtime
  document.getElementById("clock").innerText = now
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(/\./g, " : ");

  // format tanggal masehi (hari, tanggal, bulan, tahun)
  const dateMasehi = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ambil tanggal hijriah
  const hijriDate = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  // tampilkan tanggal masehi + hijriah ke halaman
  document.getElementById(
    "date"
  ).innerHTML = `${dateMasehi}<br><em>${hijriDate} H</em>`;
}

// update jam tiap 1 detik
setInterval(updateDateTime, 1000);
updateDateTime();

/* 2. BACKGROUND SLIDESHOW */
let bgIndex = 0;
const container = document.querySelector(".container");

function changeBackground() {
  // ganti background sesuai urutan array
  container.style.backgroundImage = `url('${backgrounds[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % backgrounds.length;
}

// ganti background tiap 10 detik
setInterval(changeBackground, 10000);
changeBackground();

/* 3. JADWAL SHOLAT (API) */
async function loadPrayerTimes() {
  try {
    const now = new Date();
    const dateStr = `${now.getDate()}-${
      now.getMonth() + 1
    }-${now.getFullYear()}`;

    // request ke API Aladhan untuk ambil jadwal sholat
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${city}&country=${country}&method=20`
    );
    const data = await response.json();
    const t = data.data.timings;

    // mapping jadwal ke id HTML
    const jadwal = {
      subuh: t.Fajr,
      syuruq: t.Sunrise,
      dzuhur: t.Dhuhr,
      asar: t.Asr,
      maghrib: t.Maghrib,
      isya: t.Isha,
    };

    // tampilkan jam sholat ke halaman
    for (let key in jadwal) {
      document.getElementById(key).innerText = jadwal[key];
    }

    // jalankan countdown dan highlight waktu aktif
    startNextPrayerCountdown(t);
    highlightCurrentPrayer(jadwal);
  } catch (error) {
    // kalau API error / tidak konek
    console.error("Gagal koneksi:", error);
  }
}
loadPrayerTimes();

/* 4. COUNTDOWN SHOLAT */
// Bandingin jam sekarang sama jadwal sholat,
// ambil yang paling dekat tapi belum lewat, terus hitung selisih waktunya.”
function startNextPrayerCountdown(timings) {
  function updateCountdown() {
    const now = new Date();

    // daftar waktu sholat yang akan dicek
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

    // cari sholat terdekat yang belum lewat
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

    // kalau semua sudah lewat, arahkan ke subuh besok
    if (!target) {
      target = "Subuh";
      const [h, m] = timings.Fajr.split(":");
      targetTime = new Date();
      targetTime.setDate(targetTime.getDate() + 1);
      targetTime.setHours(h, m, 0, 0);
    }

    // hitung selisih waktu
    const diff = targetTime - now;
    const hLeft = Math.floor(diff / 3600000);
    const mLeft = Math.floor((diff % 3600000) / 60000);
    const sLeft = Math.floor((diff % 60000) / 1000);

    // tampilkan countdown ke halaman
    document.getElementById("nextPrayerName").innerText = target;
    document.getElementById("nextPrayerCountdown").innerText = `${String(
      hLeft
    ).padStart(2, "0")} : ${String(mLeft).padStart(2, "0")} : ${String(
      sLeft
    ).padStart(2, "0")}`;
  }

  // update countdown tiap detik
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

/* 5. HIGHLIGHT WAKTU AKTIF */
function highlightCurrentPrayer(jadwal) {
  const now = new Date();

  // hapus highlight sebelumnya
  document
    .querySelectorAll(".prayer, .prayer-satu, .prayer-dua")
    .forEach((el) => el.classList.remove("active-prayer"));

  // mapping waktu sholat untuk dicek satu-satu
  let current = null;
  const timeMap = {
    subuh: jadwal.subuh,
    syuruq: jadwal.syuruq,
    dzuhur: jadwal.dzuhur,
    asar: jadwal.asar,
    maghrib: jadwal.maghrib,
    isya: jadwal.isya,
  };

  // cek waktu terakhir yang sudah lewat
  for (let key in timeMap) {
    const [h, m] = timeMap[key].split(":");
    const pTime = new Date();
    pTime.setHours(h, m, 0, 0);

    if (now >= pTime) {
      current = key;
    }
  }

  // kalau ketemu, kasih highlight di kotaknya
  if (current) {
    const el = document.getElementById(current);
    if (el) {
      el.parentElement.parentElement.classList.add("active-prayer");
    }
  }
}

/* 6. COUNTDOWN RAMADHAN */
function updateRamadhan() {
  const ramadhanDate = new Date("2026-03-18");
  const now = new Date();

  // hitung sisa hari menuju ramadhan
  const diff = ramadhanDate - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const textEl = document.getElementById("ramadhanCountdown");

  if (days > 0) {
    textEl.innerText = `${days} Hari Menuju Bulan Suci Ramadhan`;
  } else {
    textEl.innerText = "Ramadhan Telah Tiba!";
  }
}
updateRamadhan();
