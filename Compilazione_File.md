# 📺 Compilazione e Installazione IPTVnator su Fire TV Stick

Questa guida ti spiega come generare il file APK dal codice sorgente e come installarlo sulla tua Amazon Fire TV Stick.

## 📋 Requisiti per la Compilazione (sul tuo PC)

Per creare il file APK, devi avere installato sul tuo computer:

- **Node.js**: [Scarica qui](https://nodejs.org/)
- **Java SDK (JDK)**: Versione 17 o superiore (necessaria per Android/Gradle)
- **Android SDK**: Installabile tramite [Android Studio](https://developer.android.com/studio)

## 🏗️ Procedura di Compilazione del File APK

1. Apri un terminale (PowerShell) nella cartella del progetto (`iptvnator`).
2. Installa le dipendenze se non lo hai già fatto:
    ```powershell
    npm install -g pnpm
    pnpm install
    ```
3. Esegui lo script di build dedicato alla Fire TV:
    ```powershell
    .\scripts\build-firetv.ps1
    ```
4. Una volta completato, troverai il file APK qui:  
   `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 🚀 Installazione sulla Fire TV Stick

Dopo aver ottenuto il file `app-debug.apk`, segui questi passaggi sulla tua Fire Stick:

### 1. Prepara la Fire Stick

- Vai in **Impostazioni** > **La mia Fire TV** > **Informazioni**.
- Clicca 7 volte sulla voce **Numero build** finché non dice "Ora sei uno sviluppatore".
- Torna indietro in **Opzioni sviluppatore** e attiva **App da fonti sconosciute**.

### 2. Usa l'app Downloader

- Scarica l'app **Downloader** dall'Appstore di Amazon.
- Carica il file APK su un servizio cloud (GitHub, Google Drive, o simili).
- Nell'app Downloader, inserisci l'URL diretto al file APK per scaricarlo.
- Una volta scaricato, premi **Installa**.

### 3. Alternativa rapida (via PC con ADB)

Se hai il PC collegato alla stessa rete WiFi della Fire Stick e hai `adb` installato:

1. Trova l'IP della Fire Stick (**Impostazioni** > **La mia Fire TV** > **Informazioni** > **Rete**).
2. Dal terminale del tuo PC esegui:
    ```powershell
    adb connect <IP_DELLA_FIRE_STICK>
    adb install .\android\app\build\outputs\apk\debug\app-debug.apk
    ```

---

_Nota: Questa è una versione specifica ottimizzata per l'uso con telecomando._
