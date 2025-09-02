import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { loadSiteSpecScript, getSiteSpecConfig } from 'calypso/lib/site-spec';
import type { Step as StepType } from '../../types';

// Import React for debugging and exposure purposes
import React from 'react';
import ReactDOM from 'react-dom';

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
		const initializeSiteSpec = async () => {
			try {
				// Simple React exposure for SiteSpec script
				if ( ! window.React ) {
					console.log( '🔧 Exposing React globally for SiteSpec script' );
					window.React = React;
					window.ReactDOM = ReactDOM;
				}

				// Load CSS first
				const cssUrl = 'http://localhost:8085/dist/style.css';
				console.log( '🔄 Loading SiteSpec CSS from:', cssUrl );

				const link = document.createElement( 'link' );
				link.rel = 'stylesheet';
				link.href = cssUrl;
				link.id = 'site-spec-styles';

				link.onload = () => {
					console.log( '✅ SiteSpec CSS loaded successfully' );
				};

				link.onerror = () => {
					console.error( '❌ Failed to load SiteSpec CSS from:', cssUrl );
				};

				document.head.appendChild( link );

				// Load script using the WordPress-style utility
				await loadSiteSpecScript();

				console.log( '⏳ Waiting for React to be fully available...' );
				await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

				// Check if SiteSpec is available and initialize
				if ( window.SiteSpec?.init ) {
					console.log( '✅ SiteSpec.init is available, initializing...' );
					const config = getSiteSpecConfig();

					const instance = window.SiteSpec.init( {
						container: '#site-spec',
						agentUrl: config.agentUrl,
						agentId: config.agentId,
						buildSiteUrl: config.buildSiteUrl,
						onMessage: ( message ) => console.log( 'SiteSpec message:', message ),
						onError: ( error ) => console.error( 'SiteSpec error:', error ),
					} );

					return () => {
						if ( instance?.destroy ) {
							instance.destroy();
						}
					};
				} else {
					console.error( '❌ SiteSpec.init not available:', {
						windowExists: typeof window !== 'undefined',
						siteSpecExists: typeof window !== 'undefined' ? !! window.SiteSpec : false,
						siteSpecValue: typeof window !== 'undefined' ? window.SiteSpec : 'N/A',
						siteSpecInit: typeof window !== 'undefined' ? window.SiteSpec?.init : 'N/A',
					} );
				}
			} catch ( error ) {
				console.error( '❌ Failed to initialize SiteSpec:', error );
			}
		};

		// Start initialization
		initializeSiteSpec();
	}, [] );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			{ /* SiteSpec chat interface container */ }
			<div id="site-spec"></div>
		</>
	);
};

export default LearningStep;
