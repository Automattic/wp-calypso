import { Card } from '@automattic/components';
import { SubscribersStepProps } from '../types';
import PaidSubscribers from './paid-subscribers';

interface StepPendingProps extends SubscribersStepProps {
	onStartImport: () => void;
}

export default function StepPending( {
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
	status,
}: StepPendingProps ) {
	return (
		<Card>
			<PaidSubscribers
				cardData={ cardData }
				engine={ engine }
				fromSite={ fromSite }
				selectedSite={ selectedSite }
				setAutoFetchData={ setAutoFetchData }
				siteSlug={ siteSlug }
				onStartImport={ () => {} }
				skipNextStep={ skipNextStep }
				status={ status }
			/>
		</Card>
	);
}
