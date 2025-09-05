import { useEffect } from 'react';
import { loadSiteSpecScriptAndCSS, resetSiteSpecScriptState } from './script-loader';
import { getSiteSpecConfig, isSiteSpecEnabled } from './utils';
// TypeScript declaration for SiteSpec

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
 * Custom hook for loading and managing SiteSpec resources
 *
 * This hook handles:
 * - Loading SiteSpec CSS and JavaScript only when needed
 * - Initializing the SiteSpec widget when ready
 * - Cleaning up resources when component unmounts
 * - Preventing duplicate script loading
 * @param options - Configuration options for the hook
 * @param options.container - Container selector for the widget (default: '#site-spec')
 * @param options.onMessage - Message handler callback
 * @param options.onError - Error handler callback
 * @returns Object with loading state and cleanup function
 */
export function useSiteSpec(
	options: {
		container?: string;
		onMessage?: ( message: unknown ) => void;
		onError?: ( error: unknown ) => void;
	} = {}
) {
	const { container = '#site-spec-container', onMessage, onError } = options;

	/**
	 * Load SiteSpec resources on mount and cleanup on unmount
	 */
	useEffect( () => {
		// Only load if SiteSpec is enabled
		if ( ! isSiteSpecEnabled() ) {
			// eslint-disable-next-line no-console
			console.log( 'SiteSpec is not enabled' );
			return;
		}

		// Use the existing script-loader function
		loadSiteSpecScriptAndCSS()
			.then( () => {
				// eslint-disable-next-line no-console
				console.log( 'SiteSpec resources loaded successfully' );
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( 'Failed to load SiteSpec resources:', error );
			} );

		// Cleanup on unmount
		return () => {
			resetSiteSpecScriptState();
		};
	}, [] );

	/**
	 * Initialize SiteSpec widget when script is loaded
	 */
	useEffect( () => {
		const initializeSiteSpec = () => {
			try {
				// Initialize SiteSpec when available
				if ( window.SiteSpec?.init ) {
					// Check if SiteSpec is already initialized on this container
					// Dont we already have a check for this in the script-loader?
					// Maybe we can just use the containerElement directly?
					// Do we really need to check this?
					// TODO: Remove this check
					const containerElement = document.querySelector( container );
					if ( containerElement && containerElement.querySelector( '.site-spec-app' ) ) {
						// eslint-disable-next-line no-console
						console.log( 'SiteSpec already initialized on this container' );
						return;
					}

					// Clear any existing content
					containerElement.innerHTML = '';
					// Use the DOM element directly
					window.SiteSpec.init( {
						container: containerElement as HTMLElement,
						...getSiteSpecConfig(),
						onMessage,
						onError,
					} );
					// eslint-disable-next-line no-console
					console.log( 'SiteSpec initialized successfully' );
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to initialize SiteSpec:', error );
			}
		};

		// Check if SiteSpec is already available
		if ( window.SiteSpec?.init ) {
			initializeSiteSpec();
		} else {
			// Wait for script to load
			const checkInterval = setInterval( () => {
				if ( window.SiteSpec?.init ) {
					clearInterval( checkInterval );
					initializeSiteSpec();
				}
			}, 100 );

			// Cleanup interval after 10 seconds
			const timeout = setTimeout( () => {
				clearInterval( checkInterval );
			}, 10000 );

			return () => {
				clearInterval( checkInterval );
				clearTimeout( timeout );
			};
		}
	}, [ container, onMessage, onError ] );

	return {
		loadSiteSpecScriptAndCSS,
		resetSiteSpecScriptState,
	};
}
