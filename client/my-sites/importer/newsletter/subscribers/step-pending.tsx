import { Card } from '@automattic/components';
import { SubscribersStepProps } from '../types';
import PaidSubscribers from './paid-subscribers';

export default function StepPending( {
	nextStepUrl,
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
	status,
}: SubscribersStepProps ) {
	return (
		<Card>
			<PaidSubscribers
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
		</Card>
	);
}
