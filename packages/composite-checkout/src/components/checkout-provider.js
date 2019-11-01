/**
 * External dependencies
 */
import React, { useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import { getPaymentMethods } from '../lib/payment-methods';
import localizeFactory from '../lib/localize';
import defaultTheme from '../theme';

export const CheckoutProvider = ( {
	locale,
	total,
	items,
	onSuccess,
	onFailure,
	successRedirectUrl,
	failureRedirectUrl,
	eventHandler,
	theme,
	children,
} ) => {
	const localize = localizeFactory( locale );
	const paymentMethods = getPaymentMethods();
	const [ paymentData, dispatchPaymentAction ] = usePaymentState( eventHandler );
	const [ paymentMethodId, setPaymentMethodId ] = useState( paymentMethods[ 0 ].id );
	const paymentMethod = getPaymentMethods().find( ( { id } ) => id === paymentMethodId );
	if (
		! locale ||
		! total ||
		! items ||
		! onSuccess ||
		! onFailure ||
		! successRedirectUrl ||
		! failureRedirectUrl
	) {
		throw new Error( 'CheckoutProvider missing required props' );
	}
	const value = {
		dispatchPaymentAction,
		paymentData,
		localize,
		paymentMethodId,
		total,
		items,
		setPaymentMethodId,
		onSuccess,
		onFailure,
		successRedirectUrl,
		failureRedirectUrl,
	};
	const { CheckoutWrapper = React.Fragment } = paymentMethod || {};
	return (
		<ThemeProvider theme={ theme || defaultTheme }>
			<CheckoutContext.Provider value={ value }>
				<CheckoutWrapper>{ children }</CheckoutWrapper>
			</CheckoutContext.Provider>
		</ThemeProvider>
	);
};

CheckoutProvider.propTypes = {
	theme: PropTypes.object,
	eventHandler: PropTypes.func,
	locale: PropTypes.string.isRequired,
	total: PropTypes.object.isRequired,
	items: PropTypes.arrayOf( PropTypes.object ).isRequired,
	paymentMethodId: PropTypes.string,
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	successRedirectUrl: PropTypes.string.isRequired,
	failureRedirectUrl: PropTypes.string.isRequired,
};

export const useLineItems = () => {
	const { total, items } = useContext( CheckoutContext );
	return [ items, total ];
};

export const useCheckoutHandlers = () => {
	const { onSuccess, onFailure } = useContext( CheckoutContext );
	return { onSuccess, onFailure };
};

export const useCheckoutRedirects = () => {
	const { successRedirectUrl, failureRedirectUrl } = useContext( CheckoutContext );
	return { successRedirectUrl, failureRedirectUrl };
};

function usePaymentState( hostHandler ) {
	const [ paymentData, setPaymentData ] = useState( {} );
	const dispatch = useCallback(
		action => {
			console.log( 'dispatch', action ); // eslint-disable-line no-console
			const next = () => paymentStateHandler( action, dispatch, setPaymentData );
			if ( ! hostHandler ) {
				next();
			}
			if ( hostHandler ) {
				hostHandler( action, dispatch, next );
			}
		},
		[ hostHandler ]
	);
	return [ paymentData, dispatch ];
}

function paymentStateHandler( { type, payload }, dispatch, setPaymentData ) {
	switch ( type ) {
		case 'STEP_CHANGED':
			// noop
			return;
		case 'PAYMENT_DATA_UPDATE':
			setPaymentData( currentData => {
				const newState = { ...currentData, ...payload };
				console.log( 'new state', newState ); // eslint-disable-line no-console
				return newState;
			} );
			return;
		case 'STRIPE_CONFIGURATION_SET':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeConfiguration: payload } } );
			return;
		case 'STRIPE_TRANSACTION_END':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeTransactionStatus: 'complete' } } );
			return;
		case 'STRIPE_TRANSACTION_AUTH':
			dispatch( {
				type: 'PAYMENT_DATA_UPDATE',
				payload: { stripeTransactionStatus: 'auth', stripeTransactionAuthData: payload },
			} );
			return;
		case 'STRIPE_TRANSACTION_REDIRECT':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeTransactionStatus: 'redirect' } } );
			return;
		case 'STRIPE_TRANSACTION_ERROR':
			dispatch( {
				type: 'PAYMENT_DATA_UPDATE',
				payload: { stripeTransactionStatus: 'error', stripeTransactionError: payload },
			} );
			return;
		case 'STRIPE_TRANSACTION_RESPONSE':
			if ( payload && payload.message && payload.message.payment_intent_client_secret ) {
				dispatch( { type: 'STRIPE_TRANSACTION_AUTH', payload } );
				return;
			}
			if ( payload && payload.redirect_url ) {
				dispatch( { type: 'STRIPE_TRANSACTION_REDIRECT', payload } );
				return;
			}
			dispatch( { type: 'STRIPE_TRANSACTION_END', payload } );
			return;
		case 'STRIPE_CONFIGURATION_FETCH':
		case 'STRIPE_TRANSACTION_BEGIN':
			throw new Error( `The action '${ type }' must be handled by the host page` );
		default:
			throw new Error( `Unknown action type '${ type }'` );
	}
}
