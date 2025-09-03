import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { loadSiteSpecScript, loadSiteSpecCSS, getSiteSpecConfig } from 'calypso/lib/site-spec';
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
				// Expose React globally for SiteSpec script compatibility
				if ( ! window.React ) {
					window.React = React;
					window.ReactDOM = ReactDOM;
				}

				// Load SiteSpec CSS first to ensure styling is available
				try {
					console.log( '🎨 Loading SiteSpec CSS...' );
					await loadSiteSpecCSS();
					console.log( '✅ SiteSpec CSS loaded successfully' );
				} catch ( error ) {
					console.warn( '⚠️ CSS loading failed, continuing with script:', error );
				}

				// Load SiteSpec script
				await loadSiteSpecScript();

				// Wait for script to be fully available
				await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

				// Initialize SiteSpec if available
				if ( window.SiteSpec?.init ) {
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
					console.error( 'SiteSpec initialization failed: init function not available' );
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
