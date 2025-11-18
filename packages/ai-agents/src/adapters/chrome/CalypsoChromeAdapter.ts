import type { ChromeAdapter } from './ChromeAdapter';

/**
 * Calypso Chrome Adapter
 *
 * Handles DOM manipulation for Calypso contexts (help-center, etc.).
 * Applies minimal chrome styling for Calypso's layout.
 */
export class CalypsoChromeAdapter implements ChromeAdapter {
	private containerSelector: string;
	private containerClass: string;
	private containerOpenClass: string;

	/**
	 * Create a new Calypso Chrome Adapter
	 *
	 * @param {string} containerSelector - CSS selector for the container
	 * @param {string} containerClass - Class to add when docked
	 * @param {string} containerOpenClass - Class to add when open
	 */
	constructor(
		containerSelector = '.help-center',
		containerClass = 'ai-agent-sidebar-container',
		containerOpenClass = 'ai-agent-sidebar-container--sidebar-open'
	) {
		this.containerSelector = containerSelector;
		this.containerClass = containerClass;
		this.containerOpenClass = containerOpenClass;
	}

	applyChrome( isDocked: boolean, isCollapsed: boolean ): void {
		if ( ! isDocked || isCollapsed ) {
			this.removeChrome();
			return;
		}

		const container = document.querySelector< HTMLElement >( this.containerSelector );
		if ( ! container ) {
			return;
		}

		container.classList.add( this.containerClass, this.containerOpenClass );
	}

	removeChrome(): void {
		const container = document.querySelector< HTMLElement >( this.containerSelector );
		if ( ! container ) {
			return;
		}

		container.classList.remove( this.containerClass, this.containerOpenClass );
	}

	getContainerSelector(): string {
		return this.containerSelector;
	}
}
