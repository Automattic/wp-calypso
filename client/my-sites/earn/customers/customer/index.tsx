import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Subscriber } from '../../types';
import CustomerDetails from './customer-details';
import CustomerHeader from './customer-header';
import CustomerStats from './customer-stats';

import './style.scss';

type CustomerProps = {
	customer: Subscriber;
};

const Customer = ( { customer }: CustomerProps ) => {
	const translate = useTranslate();

	function redirectToStripe() {
		const stripeUrl = `https://dashboard.stripe.com/search?query=metadata%3A${ customer.user.ID }`;
		window.open( stripeUrl, '_blank' );
	}

	return (
		<div className="customer">
			<CustomerHeader customer={ customer } />
			<CustomerStats customer={ customer } />
			<CustomerDetails customer={ customer } />
			<Button className="customer__stripe-button" primary onClick={ redirectToStripe }>
				{ translate( 'Visit Stripe Dashboard' ) }
			</Button>
		</div>
	);
};

export default Customer;
