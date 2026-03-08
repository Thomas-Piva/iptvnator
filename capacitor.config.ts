import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.iptvnator.firetv',
    appName: 'IPTVnator',
    webDir: 'dist/apps/web',
    server: {
        androidScheme: 'https',
    },
    android: {
        buildOptions: {
            releaseType: 'APK',
        },
        // Allow mixed content for IPTV streams (HTTP + HTTPS)
        allowMixedContent: true,
    },
};

export default config;
