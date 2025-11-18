import type { ChromeAdapter } from './ChromeAdapter';

/**
 * WordPress Chrome Adapter Configuration
 */
interface WordPressChromeConfig {
	containerSelector: string;
	bodyClass?: string;
	adminBarSelector?: string;
	adminBarClass?: string;
	containerClass?: string;
	containerOpenClass?: string;
}

/**
 * WordPress Chrome Adapter
 *
 * Handles DOM manipulation for WordPress contexts (wp-admin, block-editor, site-editor).
 * Applies context-specific classes to body, admin bar, and container elements.
 */
export class WordPressChromeAdapter implements ChromeAdapter {
	private config: WordPressChromeConfig;

	/**
	 * Create a new WordPress Chrome Adapter
	 *
	 * @param {WordPressChromeConfig} config - Chrome configuration
	 */
	constructor( config: WordPressChromeConfig ) {
		this.config = config;
	}

	applyChrome( isDocked: boolean, isCollapsed: boolean ): void {
		if ( ! isDocked || isCollapsed ) {
			this.removeChrome();
			return;
		}

		const container = document.querySelector< HTMLElement >( this.config.containerSelector );

		// Apply body class
		if ( this.config.bodyClass ) {
			document.body.classList.add( this.config.bodyClass );
		}

		// Apply admin bar class
		if ( this.config.adminBarSelector && this.config.adminBarClass ) {
			const adminBar = document.querySelector( this.config.adminBarSelector );
			if ( adminBar ) {
				adminBar.classList.add( this.config.adminBarClass );
			}
		}

		// Apply container classes
		if ( container ) {
			if ( this.config.containerClass ) {
				container.classList.add( this.config.containerClass );
			}
			if ( this.config.containerOpenClass ) {
				container.classList.add( this.config.containerOpenClass );
			}
		}
	}

	removeChrome(): void {
		const container = document.querySelector< HTMLElement >( this.config.containerSelector );

		// Remove body class
		if ( this.config.bodyClass ) {
			document.body.classList.remove( this.config.bodyClass );
		}

		// Remove admin bar class
		if ( this.config.adminBarSelector && this.config.adminBarClass ) {
			const adminBar = document.querySelector( this.config.adminBarSelector );
			if ( adminBar ) {
				adminBar.classList.remove( this.config.adminBarClass );
			}
		}

		// Remove container classes
		if ( container ) {
			if ( this.config.containerClass ) {
				container.classList.remove( this.config.containerClass );
			}
			if ( this.config.containerOpenClass ) {
				container.classList.remove( this.config.containerOpenClass );
			}
		}
	}

	getContainerSelector(): string {
		return this.config.containerSelector;
	}

	/**
	 * Factory method: Create adapter for WP Admin context
	 */
	static forWpAdmin(): WordPressChromeAdapter {
		return new WordPressChromeAdapter( {
			containerSelector: '#wpwrap',
			bodyClass: 'ai-agent-wp-admin-docked',
			adminBarSelector: '#wpadminbar',
			adminBarClass: 'ai-agent-wp-admin-bar-docked',
			containerClass: 'ai-agent-sidebar-container',
			containerOpenClass: 'ai-agent-sidebar-container--sidebar-open',
		} );
	}

	/**
	 * Factory method: Create adapter for Block Editor context
	 */
	static forBlockEditor(): WordPressChromeAdapter {
		return new WordPressChromeAdapter( {
			containerSelector: '.block-editor #editor',
			containerClass: 'ai-agent-sidebar-container',
			containerOpenClass: 'ai-agent-sidebar-container--sidebar-open',
		} );
	}

	/**
	 * Factory method: Create adapter for Site Editor context
	 */
	static forSiteEditor(): WordPressChromeAdapter {
		return new WordPressChromeAdapter( {
			containerSelector: '#site-editor .edit-site-layout__canvas-container',
			containerClass: 'ai-agent-sidebar-container',
			containerOpenClass: 'ai-agent-sidebar-container--sidebar-open',
		} );
	}
}
