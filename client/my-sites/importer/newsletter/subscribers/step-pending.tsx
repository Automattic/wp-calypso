import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { toInteger } from 'lodash';
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
	const allEmailsCount = toInteger( cardData?.meta?.email_count ) || 0;

	return (
		<Card>
			<Notice status="success" className="importer__notice" isDismissible={ false }>
				All set! We’ve found <strong>{ allEmailsCount } subscribers</strong> to import.
			</Notice>

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
