# 📄 Service Agreement Form (React + Vite)

Frontend aplikasi untuk pengisian **form perjanjian layanan (service agreement)**, dibangun dengan React dan Vite. Form ini memungkinkan klien (perorangan atau perusahaan) untuk mengisi data layanan, mengunggah dokumen, dan mengirimkannya ke backend untuk diproses dan disimpan ke Google Drive.

---

## ✨ Fitur Utama

- ✅ Form dinamis berdasarkan jenis klien (perorangan/perusahaan)
- 📄 Autofill data tagihan (nama, alamat, NPWP, dll.)
- 📥 Autofill isi file Excel berdasarkan input pengguna
- 📎 Upload file dokumen pendukung (PDF, gambar, dll.)
- 🧾 Validasi data menggunakan Zod + React Hook Form
- 🔗 Terintegrasi dengan backend (Netlify Function)

---

## 🛠️ Teknologi yang Digunakan

- ⚛️ [React](https://reactjs.org/)
- ⚡ [Vite](https://vitejs.dev/)
- 🧩 [TanStack Form](https://tanstack.com/form/latest)
- 🔐 [Zod](https://github.com/colinhacks/zod)
- 🌐 [Axios](https://axios-http.com/)
- 💅 [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Menjalankan Secara Lokal

Untuk menjalankan proyek ini di komputer lokal:

1. **Clone repositori:**

   ```bash
   git clone https://github.com/hadihalimm/rpx-client-service-agreement-form
   cd rpx-client-service-agreement-form
   ```

2. **Install dependensi:**

   ```bash
   npm install
   ```

3. **Buat file `.env` di direktori root dan isi seperti ini:**

   ```env
   VITE_API_BASE_URL=https://your-netlify-function-endpoint.netlify.app/.netlify/functions
   ```

   Gantilah URL di atas sesuai dengan endpoint Netlify Function atau endpoint server lain.

4. **Jalankan aplikasi:**

   ```bash
   npm run dev
   ```

5. **Akses di browser:**

   ```
   http://localhost:5173
   ```

---
