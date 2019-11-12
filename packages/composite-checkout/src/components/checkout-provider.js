/**
 * External dependencies
 */
import React, { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import { LocalizeProvider } from '../lib/localize';
import { LineItemsProvider } from '../lib/line-items';
import { RegistryProvider, createRegistry } from '../lib/registry';
import defaultTheme from '../theme';

export const CheckoutProvider = ( {
	locale,
	total,
	items,
	onSuccess,
	onFailure,
	successRedirectUrl,
	failureRedirectUrl,
	theme,
	paymentMethods: allPaymentMethods,
	registry,
	children,
} ) => {
	const [ paymentMethodId, setPaymentMethodId ] = useState(
		allPaymentMethods ? allPaymentMethods[ 0 ].id : null
	);
	validateArg( locale, 'CheckoutProvider missing required prop: locale' );
	validateArg( total, 'CheckoutProvider missing required prop: total' );
	validateArg( items, 'CheckoutProvider missing required prop: items' );
	validateArg( allPaymentMethods, 'CheckoutProvider missing required prop: paymentMethods' );
	validatePaymentMethods( allPaymentMethods );
	validateArg( onSuccess, 'CheckoutProvider missing required prop: onSuccess' );
	validateArg( onFailure, 'CheckoutProvider missing required prop: onFailure' );
	validateArg( successRedirectUrl, 'CheckoutProvider missing required prop: successRedirectUrl' );
	validateArg( failureRedirectUrl, 'CheckoutProvider missing required prop: failureRedirectUrl' );

	const CheckoutWrappers = allPaymentMethods
		.map( method => method.CheckoutWrapper )
		.filter( Boolean );

	// Create the registry automatically if it's not a prop
	const registryRef = useRef( registry );
	registryRef.current = registryRef.current || createRegistry();

	const value = {
		allPaymentMethods,
		paymentMethodId,
		setPaymentMethodId,
		onSuccess,
		onFailure,
		successRedirectUrl,
		failureRedirectUrl,
	};
	return (
		<ThemeProvider theme={ theme || defaultTheme }>
			<RegistryProvider value={ registryRef.current }>
				<LocalizeProvider locale={ locale }>
					<LineItemsProvider items={ items } total={ total }>
						<CheckoutContext.Provider value={ value }>
							<PaymentMethodWrapperProvider wrappers={ CheckoutWrappers }>
								{ children }
							</PaymentMethodWrapperProvider>
						</CheckoutContext.Provider>
					</LineItemsProvider>
				</LocalizeProvider>
			</RegistryProvider>
		</ThemeProvider>
	);
};

CheckoutProvider.propTypes = {
	theme: PropTypes.object,
	registry: PropTypes.object,
	locale: PropTypes.string.isRequired,
	total: PropTypes.object.isRequired,
	items: PropTypes.arrayOf( PropTypes.object ).isRequired,
	paymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	paymentMethodId: PropTypes.string,
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	successRedirectUrl: PropTypes.string.isRequired,
	failureRedirectUrl: PropTypes.string.isRequired,
};

function PaymentMethodWrapperProvider( { children, wrappers } ) {
	return wrappers.reduce( ( whole, Wrapper ) => {
		return <Wrapper>{ whole }</Wrapper>;
	}, children );
}

function validateArg( value, errorMessage ) {
	if ( ! value ) {
		throw new Error( errorMessage );
	}
}

function validatePaymentMethods( paymentMethods ) {
	paymentMethods.map( validatePaymentMethod );
}

function validatePaymentMethod( {
	id,
	LabelComponent,
	PaymentMethodComponent,
	BillingContactComponent,
	SubmitButtonComponent,
	SummaryComponent,
	getAriaLabel,
} ) {
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( LabelComponent, `Invalid payment method '${ id }'; missing LabelComponent` );
	validateArg(
		BillingContactComponent,
		`Invalid payment method '${ id }'; missing BillingContactComponent`
	);
	validateArg(
		PaymentMethodComponent,
		`Invalid payment method '${ id }'; missing PaymentMethodComponent`
	);
	validateArg(
		SubmitButtonComponent,
		`Invalid payment method '${ id }'; missing SubmitButtonComponent`
	);
	validateArg( SummaryComponent, `Invalid payment method '${ id }'; missing SummaryComponent` );
	validateArg( getAriaLabel, `Invalid payment method '${ id }'; missing getAriaLabel` );
}

export const useCheckoutHandlers = () => {
	const { onSuccess, onFailure } = useContext( CheckoutContext );
	if ( ! onSuccess || ! onFailure ) {
		throw new Error( 'useCheckoutHandlers can only be used inside a CheckoutProvider' );
	}
	return { onSuccess, onFailure };
};

export const useCheckoutRedirects = () => {
	const { successRedirectUrl, failureRedirectUrl } = useContext( CheckoutContext );
	if ( ! successRedirectUrl || ! failureRedirectUrl ) {
		throw new Error( 'useCheckoutRedirects can only be used inside a CheckoutProvider' );
	}
	return { successRedirectUrl, failureRedirectUrl };
};
