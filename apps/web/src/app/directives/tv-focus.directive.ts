import {
    Directive,
    ElementRef,
    afterNextRender,
    input,
    output,
    inject,
} from '@angular/core';
import { PlatformDetectionService } from '../services/platform-detection.service';

/**
 * Directive that enhances elements for D-pad (remote control) navigation.
 * When running on a TV device, it:
 * - Makes the element focusable via tabindex
 * - Adds a visible focus ring via CSS class
 * - Handles Enter key as click action
 * - Optionally auto-focuses the element on init
 *
 * Usage:
 *   <button appTvFocus>Click me</button>
 *   <button appTvFocus [tvAutoFocus]="true">I'll be focused first</button>
 */
@Directive({
    selector: '[appTvFocus]',
    standalone: true,
    host: {
        '[attr.tabindex]': 'isTV ? 0 : null',
        '[class.tv-focusable]': 'isTV',
        '(keydown.enter)': 'onEnterKey($event)',
        '(keydown.space)': 'onEnterKey($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
    },
})
export class TvFocusDirective {
    readonly tvAutoFocus = input(false);
    readonly tvEnterPressed = output<void>();

    private readonly el = inject(ElementRef);
    private readonly platform = inject(PlatformDetectionService);

    get isTV(): boolean {
        return this.platform.isTVDevice();
    }

    constructor() {
        afterNextRender(() => {
            if (this.isTV && this.tvAutoFocus()) {
                // Delay to ensure the element is rendered
                setTimeout(() => {
                    this.el.nativeElement.focus();
                }, 100);
            }
        });
    }

    onEnterKey(event: Event): void {
        if (!this.isTV) return;
        event.preventDefault();
        // Simulate click on Enter/Space for TV remote
        this.el.nativeElement.click();
        this.tvEnterPressed.emit();
    }

    onFocus(): void {
        if (this.isTV) {
            this.el.nativeElement.classList.add('tv-focused');
        }
    }

    onBlur(): void {
        if (this.isTV) {
            this.el.nativeElement.classList.remove('tv-focused');
        }
    }
}
