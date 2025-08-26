import { Step } from '@automattic/onboarding';
import { siteSpecManager } from '@automattic/site-spec';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import type { Step as StepType } from '../../types';

// TypeScript declaration for SiteSpec
declare global {
	interface Window {
		SiteSpec?: {
			init: ( config: {
				container: string;
				apiUrl: string;
				agentId: string;
				onMessage: ( message: unknown ) => void;
				onError: ( error: unknown ) => void;
			} ) => void;
		};
	}
}

const LearningStep: StepType = function LearningStep( { navigation } ) {
	useEffect( () => {
		siteSpecManager.init( {
			container: '#sitespec',
			agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
			agentId: 'site-spec',
		} );
	}, [] );

	return (
		<>
			<DocumentHead title={ headerText } />
			{ /* SiteSpec chat interface container */ }
			<div id="sitespec"></div>
		</>
	);
};

export default LearningStep;
