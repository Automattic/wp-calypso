import { Card } from '@automattic/components';
import { Icon, people, currencyDollar } from '@wordpress/icons';
import { toInteger } from 'lodash';
import { StepProps } from '../types';
import PaidSubscribers from './paid-subscribers';
import StartImportButton from './start-import-button';

import './step-pending.scss';

export default function StepPending( {
	nextStepUrl,
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	isFetchingContent,
	setAutoFetchData,
	status,
}: StepProps ) {
	const all_emails = toInteger( cardData?.meta?.email_count ) || 0;
	const paid_emails = toInteger( cardData?.meta?.paid_subscribers_count ) || 0;
	const free_emails = all_emails - paid_emails;

	return (
		<Card>
			<div className="step-pending">
				<h2>Finished analizing the subscriber import</h2>
				{ ! paid_emails && !! free_emails && <>We’ve found { free_emails } free subscribers.</> }
				{ !! paid_emails && ! free_emails && <>We’ve found { paid_emails } paid subscribers.</> }
				{ !! paid_emails && !! free_emails && (
					<>
						We’ve found { all_emails } subscribers.
						<ul>
							{ free_emails !== 0 && (
								<li>
									<Icon icon={ people } />
									<strong>{ free_emails }</strong> are free subscribers
								</li>
							) }
							{ paid_emails !== 0 && (
								<li>
									<Icon icon={ currencyDollar } />
									<strong>{ paid_emails }</strong> are paying subscribers
								</li>
							) }
						</ul>
					</>
				) }
			</div>
			{ ! cardData?.is_connected_stripe && (
				<StartImportButton
					engine={ engine }
					siteId={ selectedSite.ID }
					hasPaidSubscribers={ !! paid_emails }
					step="subscribers"
				/>
			) }
			<PaidSubscribers
				cardData={ cardData }
				engine={ engine }
				fromSite={ fromSite }
				isFetchingContent={ isFetchingContent }
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
