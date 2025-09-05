import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteSpec } from 'calypso/lib/site-spec';
import type { Step as StepType } from '../../types';

const LearningStep: StepType = function LearningStep() {
	const translate = useTranslate();
	// Use the SiteSpec hook to handle the loading and initialization of the SiteSpec widget
	useSiteSpec();

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div id="site-spec-container" />
		</>
	);
};

export default LearningStep;
