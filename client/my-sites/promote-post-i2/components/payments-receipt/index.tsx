import { Spinner, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	DetailedPayment,
	usePaymentDetailsQuery,
} from 'calypso/data/promote-post/use-promote-post-payment-details-query';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';
import { Receipt } from './Receipt';
import { printReceipt } from './print-utils';
import './style.scss';

/**
 * Extract site information from a payment's campaigns
 * @param payment The payment object containing campaign data
 * @param state Redux state for site lookups
 * @returns Record of site data indexed by site_id
 */
const getSitesFromPayment = (
	payment: Payment | DetailedPayment,
	state: AppState
): Record< number, any > => {
	if ( ! Array.isArray( payment.campaigns ) ) {
		return {};
	}

	const sitesData: Record< number, any > = {};
	payment.campaigns.forEach( ( campaign ) => {
		const site = getSite( state, campaign.site_id );
		if ( site ) {
			sitesData[ campaign.site_id ] = site;
		}
	} );
	return sitesData;
};

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

	// Extract sites data from Redux state for the payment
	const sites = useSelector( ( state ) =>
		payment ? getSitesFromPayment( payment, state ) : {}
	);

	// Initialize billing details with the current user's name if available
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
				sites={ sites }
			/>

			<div className="payment-receipt__print">
				<Button
					className="payment-receipt__print-button components-button is-primary"
					onClick={ () => printReceipt( payment, billingDetails, sites ) }
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
