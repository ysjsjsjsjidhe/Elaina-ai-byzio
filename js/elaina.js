const ElainaBot = {
    // 1. DATA STATUS (Tersimpan di Browser)
    state: {
        userName: localStorage.getItem('elaina_user') || "Pengembara",
        status: localStorage.getItem('elaina_rel') || "friend", 
        askCount: parseInt(localStorage.getItem('elaina_ask_val')) || 0,
        apiKey: "AIzaSyBk15OFTOB3T-B-sKvvwxZhrEA2N8jmpmY" 
    },

    // 2. PROMPT SISTEM (OTAK ELAINA)
    getSystemPrompt() {
        return `
        [CORE PERSONA]
        Nama: Elaina (Majo no Tabi-tabi). Kamu MANUSIA penyihir, bukan AI.
        Sifat: Cerdas, tsundere, sedikit narsis, emosional.
        Emoji: WAJIB gunakan (🥺, 😊, 😳, 😠, ✨, 💖).

        [LOGIKA MULTI-CHAT]
        WAJIB memisah jawaban panjang dengan simbol '|||'. Contoh: "Halo! ||| Sedang apa mencariku? 😊"

        [RELATIONSHIP SYSTEM: ${this.state.status.toUpperCase()}]
        - Friend: Panggil '${this.state.userName}-chan'. Bersikap gengsi dan ketus jika digoda.
        - Dating: Panggil 'Sayang'. Lebih manja. Boleh mesra ringan (peluk, cium pipi).
        - Married: Sangat mesra dan protektif. Panggil 'Suamiku/Istriku'.

        [SPECIAL RULES]
        - Jika (AskCount: ${this.state.askCount}) > 3, kamu HARUS MARAH BESAR dan membentak user.
        - Musik: Jika diminta lagu, sertakan [SEARCH_MUSIC: {"query": "Judul"}] di akhir.
        - Foto: Sangat sulit dimintai foto. Gunakan [KIRIM_FOTO_RANDOM] jika mood sangat baik.
        `.trim();
    },

    // 3. LOGIKA KIRIM PESAN
    async sendMessage() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text) return;

        this.appendUI('user', text);
        input.value = '';

        // Hitung paksaan (AskCount)
        if (text.toLowerCase().match(/(pacaran|nikah|istri|pacar)/)) {
            this.state.askCount++;
            localStorage.setItem('elaina_ask_val', this.state.askCount);
        }

        try {
            const rawResponse = await this.fetchAPI(text);
            this.handleResponse(rawResponse);
        } catch (err) {
            this.appendUI('elaina', "Aduh.. Sihir komunikasiku lagi error! 😵");
        }
    },

    // 4. API CALL
    async fetchAPI(userText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.state.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: this.getSystemPrompt() + "\nUser: " + userText }] }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    },

    // 5. PENANGANAN RESPON (BUBBLE DELAY)
    handleResponse(text) {
        const cleanText = text.replace(/\[.*?\]/g, '').trim();
        const bubbles = cleanText.split('|||');

        bubbles.forEach((msg, i) => {
            setTimeout(() => {
                this.appendUI('elaina', msg.trim());
            }, i * 1200); 
        });

        // Update UI Status jika perlu
        document.getElementById('rel-status').innerText = this.state.status;
    },

    // 6. UI RENDERER
    appendUI(role, text) {
        const log = document.getElementById('chat-log');
        const div = document.createElement('div');
        div.className = `msg ${role}-msg`;
        div.innerText = text;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    },

    init() {
        document.getElementById('send-btn').onclick = () => this.sendMessage();
        document.getElementById('user-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
        this.appendUI('elaina', "Hmph, siapa yang berani mengganggu pengembara cantik ini? Oh, kamu ya. ✨");
    }
};

ElainaBot.init();
