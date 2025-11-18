import type { ChromeAdapter } from './ChromeAdapter';

/**
 * Generic Chrome Adapter
 *
 * Provides minimal chrome management without context-specific DOM manipulation.
 * Useful as a fallback or for simple implementations.
 */
export class GenericChromeAdapter implements ChromeAdapter {
	private containerSelector: string;

	/**
	 * Create a new Generic Chrome Adapter
	 *
	 * @param {string} containerSelector - CSS selector for the container element
	 */
	constructor( containerSelector = 'body' ) {
		this.containerSelector = containerSelector;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	applyChrome( _isDocked: boolean, _isCollapsed: boolean ): void {
		// Generic implementation doesn't apply any chrome
		// Subclasses can override this method for specific behavior
	}

	removeChrome(): void {
		// Generic implementation doesn't need to remove anything
	}

	getContainerSelector(): string {
		return this.containerSelector;
	}
}
