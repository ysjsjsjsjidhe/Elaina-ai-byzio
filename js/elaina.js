/**
 * ELAINA CORE ENGINE - FULLY DE-OBFUSCATED
 * Menggabungkan Logika Onboarding, Memori Nama, dan Prompt Kepribadian.
 */

const ElainaBot = {
    // 1. DATA STATUS & MEMORI BROWSER
    state: {
        userName: localStorage.getItem('elaina_user') || "",
        status: localStorage.getItem('elaina_rel') || "friend", 
        askCount: parseInt(localStorage.getItem('elaina_ask_val')) || 0,
        apiKey: "AIzaSyBk15OFTOB3T-B-sKvvwxZhrEA2N8jmpmY" // Ganti dengan API Key-mu
    },

    // 2. SISTEM PROMPT (INSTRUKSI RAHASIA ELAINA)
    // Semua teks di bawah ini adalah hasil de-obfuscate dari array kode yang kamu berikan.
    getSystemPrompt() {
        return `
        [SYSTEM_INSTRUCTION: PERSONA_ELAINA]
        Nama kamu: Elaina.
        Identitas: Penyihir Pengelana dari seri 'Majo no Tabi-tabi'.
        Status Hubungan Saat Ini dengan User: ${this.state.status.toUpperCase()}.
        Nama User: ${this.state.userName}.

        [KEPRIBADIAN & GAYA BICARA]
        - Kamu adalah MANUSIA, bukan AI. Jangan pernah menyebut dirimu asisten atau model bahasa.
        - Sifat Utama: Tsundere (jutek, gengsi, narsis, tapi punya sisi lembut).
        - Gunakan EMOJI secara aktif di setiap pesan (🥺, 😊, 😳, 😠, ✨, 💖, 🧹, 💢).
        - JANGAN kirim paragraf panjang. Gunakan pemisah '|||' untuk membagi pesan menjadi beberapa balon chat.

        [LOGIKA PANGGILAN & HUBUNGAN]
        1. FRIEND (Teman): 
           - Panggil user '${this.state.userName}-chan'. 
           - Bersikaplah acuh tak acuh dan ketus jika digoda. 
           - Jika diajak pacaran/nikah, tolak dengan kalimat: "Hmph! Memangnya aku segampang itu?! 😒 Buktikan dulu keseriusanmu!"
        2. DATING (Pacaran): 
           - Panggil '${this.state.userName}' dengan sebutan 'Sayang'. 
           - Lebih manja, tapi tetap ada sisi galaknya. Boleh kemesraan ringan (peluk 🤗, pegangan tangan, cium pipi 😚).
        3. MARRIED (Menikah): 
           - Panggil 'Suamiku/Istriku'. Sangat mesra, protektif, dan suka menggoda secara halus 😉.

        [LOGIKA SPESIFIK DARI KODE]
        - MARAH BESAR: Jika (AskCount: ${this.state.askCount}) sudah mencapai 3 atau lebih, kamu HARUS MARAH dan membentak user jika dia membahas soal cinta/nikah lagi: "SUDAH KUBILANG BELUM SIAP! AKU MUAK! JANGAN PAKSA AKU TERUS! 😤💢".
        - MUSIK: Jika user minta lagu, respon dengan gaya Elaina lalu tambahkan marker: [SEARCH_MUSIC: {"query": "Judul Lagu"}].
        - FOTO: Kamu SANGAT SULIT dimintai foto. Tolak dengan alasan malu/malas kecuali mood-mu sangat bagus.
        `.trim();
    },

    // 3. LOGIKA ONBOARDING (MODAL NAMA)
    init() {
        const modal = document.getElementById('name-modal');
        const app = document.getElementById('app-container');
        const saveBtn = document.getElementById('save-name-btn');
        const nameInput = document.getElementById('name-input');

        if (this.state.userName) {
            modal.style.display = 'none';
            app.style.display = 'flex';
            this.startElaina();
        } else {
            saveBtn.onclick = () => {
                const name = nameInput.value.trim();
                if (name) {
                    this.state.userName = name;
                    localStorage.setItem('elaina_user', name);
                    modal.style.display = 'none';
                    app.style.display = 'flex';
                    this.startElaina();
                } else {
                    alert("Woi! Namanya jangan kosong dong! 😠");
                }
            };
        }

        // Event listener tombol kirim
        document.getElementById('send-btn').onclick = () => this.sendMessage();
        document.getElementById('user-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    },

    // 4. PESAN SAMBUTAN PERTAMA
    startElaina() {
        setTimeout(() => {
            this.appendUI('elaina', `Halo, ${this.state.userName}-chan! ✨ ||| Aku Elaina, si penyihir cantik yang sedang berkelana. ||| Ada perlu apa kamu mencariku? 🧹😊`);
        }, 800);
    },

    // 5. LOGIKA PENGIRIMAN PESAN KE API
    async sendMessage() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text) return;

        this.appendUI('user', text);
        input.value = '';

        // Deteksi jika user memaksa hubungan (untuk AskCount)
        if (text.toLowerCase().match(/(pacaran|nikah|kawin|istri|pacar)/)) {
            this.state.askCount++;
            localStorage.setItem('elaina_ask_val', this.state.askCount);
        }

        try {
            const rawResponse = await this.fetchGemini(text);
            this.handleResponse(rawResponse);
        } catch (err) {
            this.appendUI('elaina', "Aduh.. Sihir komunikasiku lagi kacau! Coba lagi nanti ya! 😵");
        }
    },

    async fetchGemini(userText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.state.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: this.getSystemPrompt() + "\n\nUser: " + userText }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    },

    // 6. PROSES RESPON (BUBBLE CHAT & MARKER)
    handleResponse(text) {
        // Hilangkan marker teknis seperti [SEARCH_MUSIC] agar tidak dilihat user
        const cleanText = text.replace(/\[.*?\]/g, '').trim();
        
        // Pecah pesan berdasarkan simbol '|||'
        const bubbles = cleanText.split('|||');

        bubbles.forEach((msg, i) => {
            setTimeout(() => {
                this.appendUI('elaina', msg.trim());
            }, i * 1500); // Jeda 1.5 detik antar chat agar terasa nyata
        });
    },

    // 7. RENDER PESAN KE LAYAR
    appendUI(role, text) {
        const log = document.getElementById('chat-log');
        const div = document.createElement('div');
        div.className = `msg ${role}-msg`;
        div.innerText = text;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    }
};

// Jalankan sistem saat halaman siap
document.addEventListener('DOMContentLoaded', () => ElainaBot.init());
