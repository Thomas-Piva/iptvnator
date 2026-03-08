import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safe', standalone: true })
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(url: string) {
        if (url && !this.isSafeUrl(url)) {
            console.warn('SafePipe: blocked unsafe URL:', url);
            return '';
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    private isSafeUrl(url: string): boolean {
        try {
            const parsed = new URL(url, window.location.origin);
            return ['http:', 'https:', 'blob:'].includes(parsed.protocol);
        } catch {
            // Relative URLs are safe
            return !url.includes(':') || url.startsWith('/');
        }
    }
}
