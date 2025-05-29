import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { PaidSubscription } from '../../types';
import CancelDialog from '../cancel-dialog';
import PaidSubscriptionHeader from './paid-subscription-header';
import PaidSubscriptionStats from './paid-subscription-stats';

import './style.scss';

type PaidSubscriptionDetailsProps = {
	paidSubscription: PaidSubscription;
};

const PaidSubscriptionDetails = ( { paidSubscription }: PaidSubscriptionDetailsProps ) => {
	const translate = useTranslate();
	const [ subscriberToCancel, setSubscriberToCancel ] = useState< PaidSubscription | null >( null );

	function redirectToStripe() {
		const stripeUrl = `https://dashboard.stripe.com/search?query=metadata%3A${ paidSubscription.user.ID }`;
		window.open( stripeUrl, '_blank' );
	}

	return (
		<div className="customer">
			<PaidSubscriptionHeader paidSubscription={ paidSubscription } />
			<PaidSubscriptionStats paidSubscription={ paidSubscription } />
			<PaidSubscriptionDetails paidSubscription={ paidSubscription } />
			<div className="customer__action-buttons">
				<Button className="customer__stripe-button" onClick={ redirectToStripe }>
					{ translate( 'Visit Stripe Dashboard' ) }
				</Button>
				<Button
					variant="primary"
					className="customer__cancel-button"
					onClick={ () => setSubscriberToCancel( paidSubscription ) }
				>
					{ translate( 'Cancel Payment' ) }
				</Button>
			</div>
			<CancelDialog
				subscriberToCancel={ subscriberToCancel }
				setSubscriberToCancel={ setSubscriberToCancel }
			/>
		</div>
	);
};

export default PaidSubscriptionDetails;
