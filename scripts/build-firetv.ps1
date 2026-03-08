# ─────────────────────────────────────────────────────────────────────────────
# IPTVnator Fire TV Build Script
# Builds the PWA frontend, syncs to Capacitor Android, and builds the APK
# ─────────────────────────────────────────────────────────────────────────────

param(
    [switch]$SkipBuild,
    [switch]$OpenStudio
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "🔥 IPTVnator Fire TV Build" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Step 1: Build PWA frontend
if (-not $SkipBuild) {
    Write-Host "`n📦 Step 1: Building PWA frontend..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    try {
        npx nx build web --configuration=pwa
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Frontend build failed!" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Frontend build complete" -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n⏭️  Step 1: Skipping frontend build (--SkipBuild)" -ForegroundColor DarkGray
}

# Step 2: Sync web assets to Android
Write-Host "`n📱 Step 2: Syncing to Capacitor Android..." -ForegroundColor Yellow
Push-Location $ProjectRoot
try {
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Capacitor sync complete" -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 3: Open in Android Studio (optional) or build APK
if ($OpenStudio) {
    Write-Host "`n🛠️  Step 3: Opening in Android Studio..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    npx cap open android
    Pop-Location
} else {
    Write-Host "`n🏗️  Step 3: Building debug APK..." -ForegroundColor Yellow
    $GradlewPath = Join-Path $ProjectRoot "android\gradlew.bat"
    $AndroidDir = Join-Path $ProjectRoot "android"

    if (Test-Path $GradlewPath) {
        Push-Location $AndroidDir
        try {
            & .\gradlew.bat assembleDebug
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ APK build failed!" -ForegroundColor Red
                Write-Host "💡 Tip: Make sure Android SDK is installed and ANDROID_HOME is set" -ForegroundColor Yellow
                exit 1
            }

            $ApkPath = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
            if (Test-Path $ApkPath) {
                Write-Host "✅ APK built successfully!" -ForegroundColor Green
                Write-Host "📍 APK location: $ApkPath" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "To install on Fire Stick:" -ForegroundColor White
                Write-Host "  1. Enable Developer Options on Fire Stick" -ForegroundColor DarkGray
                Write-Host "  2. Enable ADB Debugging" -ForegroundColor DarkGray
                Write-Host "  3. Run: adb connect <fire-stick-ip>" -ForegroundColor DarkGray
                Write-Host "  4. Run: adb install `"$ApkPath`"" -ForegroundColor DarkGray
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "⚠️  gradlew.bat not found. Use Android Studio to build:" -ForegroundColor Yellow
        Write-Host "   Run: npx cap open android" -ForegroundColor DarkGray
    }
}

Write-Host "`n🎉 Done!" -ForegroundColor Green
