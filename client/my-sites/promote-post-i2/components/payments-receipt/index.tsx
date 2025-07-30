import { Spinner, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePaymentDetailsQuery } from 'calypso/data/promote-post/use-promote-post-payment-details-query';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { Receipt } from './Receipt';
import { printReceipt } from './print-utils';
import './style.scss';

interface PaymentReceiptProps {
	paymentId: number;
	fallbackPayment?: Payment; // Use this if the detailed query fails
	isPrintView?: boolean;
}

export const PaymentReceipt = ( {
	paymentId,
	fallbackPayment,
	isPrintView = false,
}: PaymentReceiptProps ) => {
	const { data: detailedPayment, isLoading, error } = usePaymentDetailsQuery( paymentId );

	const receiptRef = useRef< HTMLDivElement >( null );
	const currentUser = useSelector( getCurrentUser );
	const [ billingDetails, setBillingDetails ] = useState< string >( '' );

	// Use detailed payment if available, otherwise fall back to the provided payment
	const payment = detailedPayment || fallbackPayment;

	// Initialize billing details with the current user's name
	useEffect( () => {
		if ( currentUser && ! billingDetails ) {
			setBillingDetails( currentUser.display_name || '' );
		}
	}, [ currentUser, billingDetails ] );

	// Show loading state if no data is available yet
	if ( isLoading && ! payment ) {
		return (
			<div className="payment-receipt payment-receipt--loading">
				<div className="payment-receipt__loading-container">
					<Spinner />
					<p>{ __( 'Loading payment details.' ) }</p>
				</div>
			</div>
		);
	}

	// Show error state if query failed and no fallback is available
	if ( error && ! payment ) {
		return (
			<div className="payment-receipt payment-receipt--error">
				<div className="payment-receipt__error-container">
					<p>{ __( 'Failed to load payment details. Please try again.' ) }</p>
				</div>
			</div>
		);
	}

	// If we don't have any payment data, show an error
	if ( ! payment ) {
		return (
			<div className="payment-receipt payment-receipt--error">
				<div className="payment-receipt__error-container">
					<p>{ __( 'Payment not found.' ) }</p>
				</div>
			</div>
		);
	}

	return (
		<div className="payment-receipt" ref={ receiptRef }>
			{ /*This component will provide the user's view and also the print view. The `isPrintView` prop will conditionally hide things that we don't want to show on print.*/ }
			<Receipt
				payment={ payment }
				billingDetails={ billingDetails }
				isPrintView={ isPrintView }
				isLoading={ isLoading && ! detailedPayment }
				onBillingDetailsChange={ setBillingDetails }
			/>

			<div className="payment-receipt__print">
				<Button
					className="payment-receipt__print-button"
					onClick={ () => printReceipt( payment, billingDetails ) }
				>
					{ __( 'Print Receipt' ) }
				</Button>
				<div className="payment-receipt__secondary-text">
					{ __( "To save as PDF, select the PDF option in your browser's print dialog" ) }
				</div>
			</div>
		</div>
	);
};
