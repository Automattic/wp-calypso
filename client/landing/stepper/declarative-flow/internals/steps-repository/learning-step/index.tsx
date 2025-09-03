import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { loadSiteSpecScript, loadSiteSpecCSS, getSiteSpecConfig } from 'calypso/lib/site-spec';
import type { Step as StepType } from '../../types';

// TypeScript interfaces for better type safety
// We might not need these types, but i'm keeping them for now for validation
interface SiteSpecMessage {
	type: string;
	data?: unknown;
	timestamp?: number;
}

interface SiteSpecError {
	message: string;
	code?: string | number;
	stack?: string;
}

interface SiteSpecConfig {
	container: string | HTMLElement;
	agentUrl?: string;
	agentId?: string;
	buildSiteUrl?: string;
	authProvider?: () => Promise< { Authorization: string } >;
	onMessage?: ( message: SiteSpecMessage ) => void;
	onError?: ( error: SiteSpecError ) => void;
}

interface SiteSpecInstance {
	destroy: () => void;
}

// TypeScript declaration for the global SiteSpec
declare global {
	interface Window {
		SiteSpec?: {
			init: ( config: SiteSpecConfig ) => SiteSpecInstance;
		};
	}
}

const LearningStep: StepType = function LearningStep() {
	const translate = useTranslate();
	const siteSpecInstanceRef = useRef< SiteSpecInstance | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );

	// Handle SiteSpec messages with proper typing
	const handleSiteSpecMessage = useCallback( ( message: SiteSpecMessage ) => {
		// TODO: Implement proper message handling based on message.type
		console.log( 'SiteSpec message received:', message );
	}, [] );

	// Handle SiteSpec errors with proper typing
	const handleSiteSpecError = useCallback( ( error: SiteSpecError ) => {
		// TODO: Implement proper error handling and user feedback
		console.error( 'SiteSpec error occurred:', error );
	}, [] );

	// Initialize SiteSpec with proper error handling and cleanup
	useEffect( () => {
		let isMounted = true;

		const initializeSiteSpec = async (): Promise< void > => {
			try {
				// Load SiteSpec CSS first to ensure styling is available
				try {
					await loadSiteSpecCSS();
				} catch ( error ) {
					console.warn( 'SiteSpec CSS loading failed, continuing with script:', error );
				}

				// Load SiteSpec script
				await loadSiteSpecScript();

				// Wait for script to be fully available with timeout
				await new Promise( ( resolve, reject ) => {
					const timeout = setTimeout( () => {
						reject( new Error( 'SiteSpec script initialization timeout' ) );
					}, 5000 );

					const checkSiteSpec = () => {
						if ( window.SiteSpec?.init ) {
							clearTimeout( timeout );
							resolve( undefined );
						} else {
							setTimeout( checkSiteSpec, 100 );
						}
					};
					checkSiteSpec();
				} );

				// Initialize SiteSpec if available and component is still mounted
				if ( isMounted && window.SiteSpec?.init && containerRef.current ) {
					const config = getSiteSpecConfig();

					siteSpecInstanceRef.current = window.SiteSpec.init( {
						container: containerRef.current,
						agentUrl: config.agentUrl,
						agentId: config.agentId,
						buildSiteUrl: config.buildSiteUrl,
						onMessage: handleSiteSpecMessage,
						onError: handleSiteSpecError,
					} );
				}
			} catch ( error ) {
				if ( isMounted ) {
					console.error( 'Failed to initialize SiteSpec:', error );
				}
			}
		};

		// Start initialization
		initializeSiteSpec();

		// Cleanup function
		return () => {
			isMounted = false;
			if ( siteSpecInstanceRef.current?.destroy ) {
				siteSpecInstanceRef.current.destroy();
				siteSpecInstanceRef.current = null;
			}
		};
	}, [ handleSiteSpecMessage, handleSiteSpecError ] );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div
				ref={ containerRef }
				id="site-spec"
				role="main"
				aria-label={ translate( 'AI Site Builder Interface' ) }
				aria-live="polite"
			/>
		</>
	);
};

export default LearningStep;
