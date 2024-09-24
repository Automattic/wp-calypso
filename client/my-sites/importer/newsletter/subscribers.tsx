import StepDone from './subscribers/step-done';
import StepImporting from './subscribers/step-importing';
import StepInitial from './subscribers/step-initial';
import StepPending from './subscribers/step-pending';
import { SubscribersStepProps } from './types';

export default function Subscribers( {
	nextStepUrl,
	selectedSite,
	fromSite,
	status,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
}: SubscribersStepProps ) {
	// The default step
	let Step = StepInitial;
	switch ( status ) {
		case 'pending':
			Step = StepPending;
			break;
		case 'importing':
			Step = StepImporting;
			break;
		case 'done':
			Step = StepDone;
			break;
	}

	return (
		<Step
			cardData={ cardData }
			engine={ engine }
			fromSite={ fromSite }
			nextStepUrl={ nextStepUrl }
			selectedSite={ selectedSite }
			setAutoFetchData={ setAutoFetchData }
			siteSlug={ siteSlug }
			skipNextStep={ skipNextStep }
			status={ status }
		/>
	);
}
