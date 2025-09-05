import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteSpec } from 'calypso/lib/site-spec';
import type { Step as StepType } from '../../types';

// TypeScript declaration for SiteSpec

const LearningStep: StepType = function LearningStep() {
	const translate = useTranslate();
	const siteSpecContainer = 'site-spec-container-mine';
	// Use the SiteSpec hook to handle all loading and initialization
	useSiteSpec( { container: `#${ siteSpecContainer }` } );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div id={ siteSpecContainer } />
		</>
	);
};

export default LearningStep;
