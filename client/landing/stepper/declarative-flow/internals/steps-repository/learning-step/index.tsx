import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import type { Step as StepType } from '../../types';

<script src="http://localhost:8085/dist/sitespec.umd.js"></script>;

// TypeScript declaration for the global SiteSpec
declare global {
	interface Window {
		SiteSpec: {
			init: ( config: {
				container: string | HTMLElement;
				agentUrl?: string;
				agentId?: string;
				buildSiteUrl?: string;
				authProvider?: () => Promise< { Authorization: string } >;
				onMessage?: ( message: any ) => void;
				onError?: ( error: any ) => void;
			} ) => {
				destroy: () => void;
			};
		};
	}
}

const LearningStep: StepType = function LearningStep() {
	const translate = useTranslate();

	useEffect( () => {
		// Load site-spec script directly in the component
		const loadSiteSpec = () => {
			const initializeSiteSpec = () => {
				console.log( '🔄 Initializing site-spec...' );
				console.log( 'window.SiteSpec:', window.SiteSpec );

				if ( typeof window !== 'undefined' && window.SiteSpec && window.SiteSpec.init ) {
					console.log( '✅ SiteSpec.init is available, initializing...' );

					const instance = window.SiteSpec.init( {
						container: '#sitespec',
						agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
						agentId: 'site-spec',
						buildSiteUrl: 'https://wordpress.com/setup/ai-site-builder?spec_id=',
						onMessage: ( message ) => {
							console.log( 'Site spec message:', message );
						},
						onError: ( error ) => {
							console.error( 'Site spec error:', error );
						},
					} );

					console.log( '✅ Site-spec initialized successfully:', instance );

					// Cleanup function
					return () => {
						if ( instance && instance.destroy ) {
							instance.destroy();
						}
					};
				}
				console.error( '❌ SiteSpec.init not available:', {
					windowExists: typeof window !== 'undefined',
					siteSpecExists: typeof window !== 'undefined' ? !! window.SiteSpec : false,
					siteSpecValue: typeof window !== 'undefined' ? window.SiteSpec : 'N/A',
					siteSpecInit: typeof window !== 'undefined' ? window.SiteSpec?.init : 'N/A',
				} );
			};
			// Check if script is already loaded
			if ( document.querySelector( 'script[src*="sitespec.umd.js"]' ) ) {
				console.log( '✅ Site-spec script already loaded' );
				initializeSiteSpec();
				return;
			}

			console.log( '🔄 Loading site-spec script...' );
			const script = document.createElement( 'script' );
			script.src = 'http://localhost:8085/dist/sitespec.umd.js';
			script.onload = () => {
				console.log( '✅ Site-spec script loaded successfully' );
				// Wait a bit for the library to initialize
				setTimeout( initializeSiteSpec, 100 );
			};
			script.onerror = ( error ) => {
				console.error( '❌ Failed to load site-spec script:', error );
			};
			document.head.appendChild( script );
		};

		// Start loading
		loadSiteSpec();
	}, [] );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			{ /* SiteSpec chat interface container */ }
			<div id="sitespec"></div>
		</>
	);
};

export default LearningStep;
