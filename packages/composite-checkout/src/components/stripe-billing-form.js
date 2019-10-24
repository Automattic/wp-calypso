/**
 * External dependencies
 */
import React from 'react';
import styled from 'styled-components';
import { CardElement } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';
import Field from './field';
import { useStripe } from '../lib/stripe';
import { useCheckoutHandlers } from '../index';

function StripeBillingForm( { summary, isActive, paymentData, setPaymentData } ) {
	const { onFailure } = useCheckoutHandlers();
	const { stripeLoadingError, isStripeLoading } = useStripe();
	const localize = useLocalize();
	if ( stripeLoadingError ) {
		onFailure( stripeLoadingError );
		return <span>Error!</span>;
	}
	if ( isStripeLoading ) {
		return <span>Loading...</span>;
	}
	if ( summary ) {
		return <span>Summary goes here</span>; // TODO
	}
	if ( ! isActive ) {
		return null;
	}
	const { billingName = '', billingNameError = null } = paymentData || {};
	const onChange = value => setPaymentData( { ...( paymentData || {} ), billingName: value } );
	return (
		<BillingFormFields>
			<FormField
				id="billingName"
				type="Text"
				label={ localize( 'Name' ) }
				error={ billingNameError }
				errorMessage={ localize( 'This is a required field' ) }
				value={ billingName }
				onChange={ onChange }
			/>
			<CardElement />
		</BillingFormFields>
	);
}
const StripeBillingFormPure = React.memo( StripeBillingForm );
export { StripeBillingFormPure as StripeBillingForm };

const BillingFormFields = styled.div`
	margin-bottom: 16px;
`;

const FormField = styled( Field )`
	margin-top: 16px;
	:first-child {
		margin-top: 0;
	}
`;
