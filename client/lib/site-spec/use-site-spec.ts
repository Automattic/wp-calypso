import { useEffect } from 'react';
import { loadSiteSpecScriptAndCSS, resetSiteSpecScriptState } from './script-loader';
import { getDefaultSiteSpecConfig, isSiteSpecEnabled, SiteSpecConfig } from './utils';

declare global {
	interface Window {
		SiteSpec?: {
			init: ( config: {
				container: string | HTMLElement;
				agentUrl?: string;
				agentId?: string;
				buildSiteUrl?: string;
				onMessage?: ( message: unknown ) => void;
				onError?: ( error: unknown ) => void;
			} ) => void;
		};
	}
}

/**
 * Track which containers we’ve initialized to avoid double-init.
 */
const initialized = new WeakSet< HTMLElement >();

function resolveContainer( target: string | HTMLElement ): HTMLElement | null {
	if ( typeof target === 'string' ) {
		return document.querySelector( target ) as HTMLElement | null;
	}
	return target ?? null;
}

type UseSiteSpecOptions = {
	container?: string | HTMLElement;
	onMessage?: ( message: unknown ) => void;
	onError?: ( error: unknown ) => void;
	siteSpecConfig?: SiteSpecConfig;
};

/**
 * Loads SiteSpec assets (CSS/JS) and initializes the widget once.
 * Cleans up global loader state on unmount.
 */
export function useSiteSpec( options: UseSiteSpecOptions = {} ) {
	const { container = '#site-spec-container', onMessage, onError, siteSpecConfig } = options;

	useEffect( () => {
		// SSR/Non-browser guard
		if ( typeof window === 'undefined' || typeof document === 'undefined' ) {
			return;
		}

		if ( ! isSiteSpecEnabled() ) {
			return;
		}

		let containerEl: HTMLElement | null = null;

		loadSiteSpecScriptAndCSS()
			.then( () => {
				if ( ! window.SiteSpec?.init ) {
					throw new Error( 'SiteSpec init function is not available after loading.' );
				}

				containerEl = resolveContainer( container );
				if ( ! containerEl ) {
					return;
				}

				// Idempotency: skip if we've already initialized this container
				// or if the app markup already exists.
				if ( initialized.has( containerEl ) || containerEl.querySelector( '.site-spec-app' ) ) {
					return;
				}

				const config = siteSpecConfig || getDefaultSiteSpecConfig();

				window.SiteSpec.init( {
					container: containerEl,
					...config,
					onMessage,
					onError,
				} );

				initialized.add( containerEl );
			} )
			.catch( ( error ) => {
				// Error is handled by the onError callback if provided
				// eslint-disable-next-line no-console
				console.warn( 'SiteSpec initialization failed:', error );
			} );

		return () => {
			if ( containerEl ) {
				initialized.delete( containerEl );
			}
			// If the loader manages a global "loaded" flag, reset it so
			resetSiteSpecScriptState();
		};
		// Re-run only if the container target or handlers change.
	}, [ container, onMessage, onError ] );
}
