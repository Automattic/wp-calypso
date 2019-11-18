/**
 * External dependencies
 */
import React, { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'emotion-theming';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { LocalizeProvider } from '../lib/localize';
import { LineItemsProvider } from '../lib/line-items';
import { RegistryProvider, createRegistry } from '../lib/registry';
import defaultTheme from '../theme';

export const CheckoutProvider = props => {
	const {
		locale,
		total,
		items,
		onSuccess,
		onFailure,
		successRedirectUrl,
		failureRedirectUrl,
		theme,
		paymentMethods,
		registry,
		children,
	} = props;
	const [ paymentMethodId, setPaymentMethodId ] = useState(
		paymentMethods ? paymentMethods[ 0 ].id : null
	);

	// Remove undefined and duplicate CheckoutWrapper properties
	const wrappers = [
		...new Set( paymentMethods.map( method => method.CheckoutWrapper ).filter( Boolean ) ),
	];

	// Create the registry automatically if it's not a prop
	const registryRef = useRef( registry );
	registryRef.current = registryRef.current || createRegistry();

	const value = {
		allPaymentMethods: paymentMethods,
		paymentMethodId,
		setPaymentMethodId,
		onSuccess,
		onFailure,
		successRedirectUrl,
		failureRedirectUrl,
	};

	// This error message cannot be translated because translation hasn't loaded yet.
	const errorMessage = 'Sorry, there was an error loading this page';
	return (
		<CheckoutErrorBoundary errorMessage={ errorMessage }>
			<CheckoutProviderPropValidator propsToValidate={ props } />
			<ThemeProvider theme={ theme || defaultTheme }>
				<RegistryProvider value={ registryRef.current }>
					<LocalizeProvider locale={ locale }>
						<LineItemsProvider items={ items } total={ total }>
							<CheckoutContext.Provider value={ value }>
								<PaymentMethodWrapperProvider wrappers={ wrappers }>
									{ children }
								</PaymentMethodWrapperProvider>
							</CheckoutContext.Provider>
						</LineItemsProvider>
					</LocalizeProvider>
				</RegistryProvider>
			</ThemeProvider>
		</CheckoutErrorBoundary>
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

function CheckoutProviderPropValidator( { propsToValidate } ) {
	const {
		locale,
		total,
		items,
		onSuccess,
		onFailure,
		successRedirectUrl,
		failureRedirectUrl,
		paymentMethods,
	} = propsToValidate;
	validateArg( locale, 'CheckoutProvider missing required prop: locale' );
	validateArg( total, 'CheckoutProvider missing required prop: total' );
	validateTotal( total );
	validateArg( items, 'CheckoutProvider missing required prop: items' );
	validateLineItems( items );
	validateArg( paymentMethods, 'CheckoutProvider missing required prop: paymentMethods' );
	validatePaymentMethods( paymentMethods );
	validateArg( onSuccess, 'CheckoutProvider missing required prop: onSuccess' );
	validateArg( onFailure, 'CheckoutProvider missing required prop: onFailure' );
	validateArg( successRedirectUrl, 'CheckoutProvider missing required prop: successRedirectUrl' );
	validateArg( failureRedirectUrl, 'CheckoutProvider missing required prop: failureRedirectUrl' );
	return null;
}

function PaymentMethodWrapperProvider( { children, wrappers } ) {
	return wrappers.reduce( ( whole, Wrapper ) => {
		return <Wrapper>{ whole }</Wrapper>;
	}, children );
}

function validateArg( value, errorMessage ) {
	if ( value === null || value === undefined ) {
		throw new Error( errorMessage );
	}
}

function validatePaymentMethods( paymentMethods ) {
	paymentMethods.map( validatePaymentMethod );
}

function validatePaymentMethod( {
	id,
	LabelComponent,
	SubmitButtonComponent,
	SummaryComponent,
	getAriaLabel,
} ) {
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( LabelComponent, `Invalid payment method '${ id }'; missing LabelComponent` );
	validateArg(
		SubmitButtonComponent,
		`Invalid payment method '${ id }'; missing SubmitButtonComponent`
	);
	validateArg( SummaryComponent, `Invalid payment method '${ id }'; missing SummaryComponent` );
	validateArg( getAriaLabel, `Invalid payment method '${ id }'; missing getAriaLabel` );
}

function validateLineItems( items ) {
	items.map( validateLineItem );
}

function validateTotal( { label, amount } ) {
	validateArg( label, `Invalid total; missing label property` );
	validateArg( amount, `Invalid total; missing amount property` );
	validateAmount( 'total', amount );
}

function validateLineItem( { id, label, amount, type } ) {
	validateArg( id, 'Invalid line item; missing id property' );
	validateArg( label, `Invalid line item '${ id }'; missing label property` );
	validateArg( type, `Invalid line item '${ id }'; missing type property` );
	validateArg( amount, `Invalid line item '${ id }'; missing amount property` );
	validateAmount( id, amount );
}

function validateAmount( id, { currency, value, displayValue } ) {
	validateArg( currency, `Invalid line item '${ id }'; missing amount.currency property` );
	validateArg( value, `Invalid line item '${ id }'; missing amount.value property` );
	validateArg( displayValue, `Invalid line item '${ id }'; missing amount.displayValue property` );
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
