import { SubscribersStepProps } from '../types';
import StepDone from './step-done';
import StepImporting from './step-importing';
import StepInitial from './step-initial';
import StepPending from './step-pending';

export default function Subscribers( {
	nextStepUrl,
	selectedSite,
	originSite,
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
			originSite={ originSite }
			nextStepUrl={ nextStepUrl }
			selectedSite={ selectedSite }
			setAutoFetchData={ setAutoFetchData }
			siteSlug={ siteSlug }
			skipNextStep={ skipNextStep }
			status={ status }
		/>
	);
}
