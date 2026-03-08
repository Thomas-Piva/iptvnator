import { Injectable, signal } from '@angular/core';

/**
 * Detects if the app is running on Amazon Fire TV / Android TV.
 * Fire TV devices include "AFT" (Amazon Fire TV) in their user agent.
 * Android TV devices include "Android TV" or "BRAVIA" or similar.
 */
@Injectable({ providedIn: 'root' })
export class PlatformDetectionService {
    /** Whether the app is running on a Fire TV device */
    readonly isFireTV = signal(this.detectFireTV());

    /** Whether the app is running on any TV device (Fire TV or Android TV) */
    readonly isTVDevice = signal(this.detectTVDevice());

    private detectFireTV(): boolean {
        const ua = navigator.userAgent || '';
        // Amazon Fire TV devices use "AFT" prefix in model identifier
        // Examples: AFTS (Fire TV Stick), AFTM (Fire TV), AFTT (Fire TV Stick Lite)
        return /\bAFT\w*\b/.test(ua) || /\bSilk\b/.test(ua);
    }

    private detectTVDevice(): boolean {
        if (this.detectFireTV()) return true;
        const ua = navigator.userAgent || '';
        // Generic Android TV detection
        return (
            /\bAndroid TV\b/i.test(ua) ||
            /\bBRAVIA\b/i.test(ua) ||
            /\bSmartTV\b/i.test(ua)
        );
    }
}
