import type { ChromeAdapter } from './ChromeAdapter';

/**
 * Calypso Chrome Adapter
 *
 * Handles DOM manipulation and CSS injection for Calypso layout.
 * Applies visual frame around #wpcom content when agent is docked.
 */
export class CalypsoChromeAdapter implements ChromeAdapter {
	private containerSelector: string;
	private chromeStyleId: string;
	private sidebarWidth: number;
	private spacing: number;

	/**
	 * Create a new Calypso Chrome Adapter
	 * @param {string} containerSelector - CSS selector for the Calypso container (default: #wpcom)
	 * @param {number} sidebarWidth - Width of the sidebar in pixels (default: 350)
	 * @param {number} spacing - Spacing around elements in pixels (default: 16)
	 */
	constructor( containerSelector = '#wpcom', sidebarWidth = 350, spacing = 16 ) {
		this.containerSelector = containerSelector;
		this.sidebarWidth = sidebarWidth;
		this.spacing = spacing;
		this.chromeStyleId = 'ai-agent-calypso-chrome';
	}

	/**
	 * Get the chrome CSS styles
	 * Adapted from big-sky-plugin chrome styles for Calypso's #wpcom container
	 */
	private getChromeCSS(): string {
		const sidebarRight = this.sidebarWidth + this.spacing;
		return `
			body {
				background-color: #1e1e1e;
			}

			.masterbar {
				position: fixed !important;
				top: ${ this.spacing }px;
				left: ${ this.spacing }px;
				right: ${ sidebarRight }px;
				width: auto !important;
				border-radius: 8px 8px 0 0;
				border: 1px solid #545454;
				border-bottom: none;
				z-index: 99999;
			}

			${ this.containerSelector } {
				position: fixed !important;
				top: calc(47px + ${ this.spacing }px);
				left: ${ this.spacing }px;
				right: ${ sidebarRight }px;
				bottom: ${ this.spacing }px;
				width: calc(100% - ${ this.sidebarWidth }px - ${ this.spacing * 2 }px) !important;
				min-height: 0;
				box-sizing: border-box;
				border-radius: 0 0 8px 8px;
				border: 1px solid #545454;
				border-top: none;
				overflow-y: auto;
				overflow-x: hidden;
				background-color: #ffffff;
				margin: 0 !important;
			}

			.layout__content {
				background-color: #ffffff;
			}
		`;
	}

	applyChrome( isDocked: boolean, isCollapsed: boolean ): void {
		if ( ! isDocked || isCollapsed ) {
			this.removeChrome();
			return;
		}

		// Check if container exists
		const container = document.querySelector< HTMLElement >( this.containerSelector );
		if ( ! container ) {
			return;
		}

		// Check if chrome already applied
		if ( document.getElementById( this.chromeStyleId ) ) {
			return;
		}

		// Inject chrome CSS
		const style = document.createElement( 'style' );
		style.id = this.chromeStyleId;
		style.textContent = this.getChromeCSS();
		document.head.appendChild( style );
	}

	removeChrome(): void {
		const chromeStyle = document.getElementById( this.chromeStyleId );
		if ( chromeStyle ) {
			chromeStyle.remove();
		}
	}

	getContainerSelector(): string {
		return this.containerSelector;
	}
}
