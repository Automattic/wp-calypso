import type { ChromeAdapter } from './chrome-adapter';

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
	 * or wp-admin's #wpbody container
	 */
	private getChromeCSS(): string {
		const sidebarRight = this.sidebarWidth + this.spacing;
		const isWpAdmin = this.containerSelector === '#wpbody';

		if ( isWpAdmin ) {
			// WordPress admin chrome styles
			return `
				body {
					background-color: #1e1e1e;
				}

				#wpadminbar {
					position: fixed !important;
					top: ${ this.spacing }px;
					left: ${ this.spacing }px;
					right: ${ sidebarRight }px;
					width: auto !important;
					border-radius: 8px 8px 0 0;
					border: 1px solid #545454;
					border-bottom: none;
				}

				#adminmenuback,
				#adminmenuwrap {
					position: fixed !important;
					top: calc(32px + ${ this.spacing }px);
					left: ${ this.spacing }px;
					bottom: ${ this.spacing }px;
					height: calc(100vh - 32px - ${ this.spacing * 2 }px) !important;
					border-right: 1px solid #545454;
				}

				#wpcontent {
					margin-left: calc(160px + ${ this.spacing }px) !important;
					margin-right: ${ sidebarRight }px !important;
				}

				${ this.containerSelector } {
					position: fixed !important;
					top: calc(32px + ${ this.spacing }px);
					left: calc(160px + ${ this.spacing }px);
					right: ${ sidebarRight }px;
					bottom: ${ this.spacing }px;
					width: calc(100% - 160px - ${ this.sidebarWidth }px - ${ this.spacing * 2 }px) !important;
					height: calc(100vh - 32px - ${ this.spacing * 2 }px) !important;
					max-height: calc(100vh - 32px - ${ this.spacing * 2 }px) !important;
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

				#wpfooter {
					margin-right: ${ sidebarRight }px !important;
				}
			`;
		}

		// Calypso chrome styles
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
				height: calc(100vh - 47px - ${ this.spacing * 2 }px) !important;
				max-height: calc(100vh - 47px - ${ this.spacing * 2 }px) !important;
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

			.layout__secondary {
				top: calc(var(--masterbar-height) + ${ this.spacing }px) !important;
				left: ${ this.spacing }px !important;
				bottom: ${ this.spacing }px !important;
				height: calc(100vh - var(--masterbar-height) - ${ this.spacing * 2 }px) !important;
				max-height: calc(100vh - var(--masterbar-height) - ${ this.spacing * 2 }px) !important;
				outline: none !important;
				border-right: 1px solid #545454 !important;
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
