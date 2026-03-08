# 📺 Come Installare IPTVnator sulla Fire Stick

Guida passo passo per installare l'APK di IPTVnator sulla tua Amazon Fire Stick usando l'app **Downloader**.

---

## 📋 Requisiti

- Amazon Fire Stick (qualsiasi modello)
- Connessione Wi-Fi attiva sulla Fire Stick
- Il file APK: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Parte 1: Caricare l'APK Online

Prima di tutto devi rendere il file APK accessibile tramite un link URL.

### Opzione A: GitHub Releases (consigliato)

1. Vai su **github.com** → il tuo repository `Iptv-FireStick`
2. Clicca su **Releases** → **Create a new release**
3. Dai un tag (es. `v1.0.0`) e un titolo (es. `IPTVnator Fire TV v1.0`)
4. Trascina il file `app-debug.apk` nella sezione **Attach binaries**
5. Clicca **Publish release**
6. Copia il **link diretto** al file APK (tasto destro sul file → "Copia indirizzo link")

### Opzione B: Google Drive

1. Carica `app-debug.apk` su **Google Drive**
2. Tasto destro sul file → **Condividi** → **Chiunque abbia il link**
3. Copia il link di condivisione
4. ⚠️ **Importante**: Modifica il link per il download diretto:
   - Link originale: `https://drive.google.com/file/d/FILE_ID/view`
   - Link diretto: `https://drive.google.com/uc?export=download&id=FILE_ID`
   - Sostituisci `FILE_ID` con l'ID del tuo file

### Opzione C: File Hosting Rapido

Usa un servizio come **[file.io](https://file.io)**, **[transfer.sh](https://transfer.sh)** o **[tmpfiles.org](https://tmpfiles.org)**:

1. Vai sul sito scelto
2. Carica il file `app-debug.apk`
3. Copia il link generato

> ⚠️ Questi servizi cancellano il file dopo il primo download, quindi usali subito.

---

## Parte 2: Preparare la Fire Stick

### Passo 1 — Attivare le Opzioni Sviluppatore

1. Dalla **Home** della Fire Stick, vai su **Impostazioni** (icona ingranaggio)
2. Seleziona **La mia Fire TV** (o "Il mio dispositivo")
3. Clicca su **Informazioni**
4. Clicca **7 volte** sulla voce **"Numero di serie"** o **"Numero build"** → apparirà il messaggio *"Sei uno sviluppatore"*

### Passo 2 — Abilitare App da Fonti Sconosciute

1. Torna su **Impostazioni → La mia Fire TV**
2. Seleziona **Opzioni sviluppatore**
3. Attiva **App da fonti sconosciute** (o "Installa app sconosciute")
4. Se ti chiede per quale app, seleziona **Downloader** e attiva

---

## Parte 3: Installare l'App Downloader

1. Dalla **Home**, vai su **Cerca** (icona lente)
2. Digita **"Downloader"**
3. Seleziona l'app **Downloader** di AFTVnews (icona arancione)
4. Clicca **Ottieni** / **Scarica** / **Get**
5. Attendi l'installazione e poi **Apri** l'app

---

## Parte 4: Scaricare e Installare IPTVnator

1. **Apri l'app Downloader**
2. Nel campo URL in alto, **inserisci il link** del tuo APK (quello copiato nella Parte 1)
3. Premi **Go** / **Vai**
4. Attendi il download del file APK
5. Quando il download è completo, apparirà la finestra di installazione → premi **Installa**
6. Attendi l'installazione → premi **Apri** per avviare subito, oppure **Fine** per avviare dopo
7. Downloader ti chiederà se vuoi eliminare il file APK scaricato → premi **Elimina** (non serve più)

---

## Parte 5: Usare IPTVnator sulla Fire Stick

1. L'app **IPTVnator** apparirà nella sezione **App** della tua Fire Stick
2. Aprila e vai su **Sources** (Dashboard)
3. Aggiungi la tua playlist **Xtream Codes**:
   - Inserisci **URL del server**
   - Inserisci **Username** e **Password**
4. Naviga tra i canali usando il **telecomando**:
   - **Frecce direzionali** → navigazione
   - **Tasto centrale (Select)** → seleziona / apri canale
   - **Tasto Indietro** → torna indietro

---

## 🔄 Come Aggiornare l'App

Quando fai una nuova build, ripeti la procedura:

1. Esegui `.\scripts\build-firetv.ps1` per rigenerare l'APK
2. Carica il nuovo APK online (sovrascrivi la release su GitHub)
3. Sulla Fire Stick, apri **Downloader** e inserisci il nuovo link
4. Installa — sovrascriverà automaticamente la versione precedente

---

## ❓ Risoluzione Problemi

| Problema | Soluzione |
|----------|-----------|
| Downloader non appare nella ricerca | Prova a cercarlo nell'**Amazon Appstore** dal browser |
| "Installazione bloccata" | Vai in **Impostazioni → La mia Fire TV → Opzioni sviluppatore** e abilita "App da fonti sconosciute" per Downloader |
| L'app non si avvia | Riavvia la Fire Stick: **Impostazioni → La mia Fire TV → Riavvia** |
| Video non si carica | Verifica che la playlist Xtream sia corretta e la Fire Stick sia connessa a Internet |
| Navigazione non funziona | Assicurati di usare le frecce del telecomando, non toccare lo schermo |
