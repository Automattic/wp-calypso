import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { loadSiteSpecScript, loadSiteSpecCSS, getSiteSpecConfig } from 'calypso/lib/site-spec';
import type { Step as StepType } from '../../types';

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
				// Load CSS and script
				await Promise.all( [ loadSiteSpecCSS(), loadSiteSpecScript() ] );

				// Initialize SiteSpec
				if ( window.SiteSpec?.init ) {
					const config = getSiteSpecConfig();
					window.SiteSpec.init( {
						container: '#site-spec',
						...config,
					} );
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to initialize SiteSpec:', error );
			}
		};

		initializeSiteSpec();
	}, [] );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div id="site-spec" />
		</>
	);
};

export default LearningStep;
