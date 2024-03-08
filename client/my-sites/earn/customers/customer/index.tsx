import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { Subscriber } from '../../types';
import CancelDialog from '../cancel-dialog';
import CustomerDetails from './customer-details';
import CustomerHeader from './customer-header';
import CustomerStats from './customer-stats';

import './style.scss';

type CustomerProps = {
	customer: Subscriber;
};

const Customer = ( { customer }: CustomerProps ) => {
	const translate = useTranslate();
	const [ subscriberToCancel, setSubscriberToCancel ] = useState< Subscriber | null >( null );

	function redirectToStripe() {
		const stripeUrl = `https://dashboard.stripe.com/search?query=metadata%3A${ customer.user.ID }`;
		window.open( stripeUrl, '_blank' );
	}

	return (
		<div className="customer">
			<CustomerHeader customer={ customer } />
			<CustomerStats customer={ customer } />
			<CustomerDetails customer={ customer } />
			<div className="customer__action-buttons">
				<Button className="customer__stripe-button" primary onClick={ redirectToStripe }>
					{ translate( 'Visit Stripe Dashboard' ) }
				</Button>
				<Button
					className="customer__cancel-button"
					onClick={ () => setSubscriberToCancel( customer ) }
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

export default Customer;
