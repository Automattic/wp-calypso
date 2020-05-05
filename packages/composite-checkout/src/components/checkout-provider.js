/**
 * External dependencies
 */
import React, { useContext, useEffect, useCallback, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'emotion-theming';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { LocalizeProvider } from '../lib/localize';
import { LineItemsProvider } from '../lib/line-items';
import { RegistryProvider, defaultRegistry } from '../lib/registry';
import { useFormStatusManager } from '../lib/form-status';
import defaultTheme from '../theme';
import {
	validateArg,
	validateTotal,
	validateLineItems,
	validatePaymentMethods,
} from '../lib/validation';

const debug = debugFactory( 'composite-checkout:checkout-provider' );

export const CheckoutProvider = ( props ) => {
	const {
		locale,
		total,
		items,
		onPaymentComplete,
		showErrorMessage,
		showInfoMessage,
		showSuccessMessage,
		theme,
		paymentMethods,
		registry,
		onEvent,
		isLoading,
		isValidating,
		children,
	} = props;
	const [ paymentMethodId, setPaymentMethodId ] = useState(
		paymentMethods?.length ? paymentMethods[ 0 ].id : null
	);
	const [ prevPaymentMethods, setPrevPaymentMethods ] = useState( [] );
	useEffect( () => {
		if ( paymentMethods.length !== prevPaymentMethods.length ) {
			debug( 'paymentMethods changed; setting payment method to first of', paymentMethods );
			setPaymentMethodId( paymentMethods?.length ? paymentMethods[ 0 ].id : null );
			setPrevPaymentMethods( paymentMethods );
		}
	}, [ paymentMethods, prevPaymentMethods ] );

	const [ formStatus, setFormStatus ] = useFormStatusManager( isLoading, isValidating );
	const didCallOnPaymentComplete = useRef( false );
	useEffect( () => {
		if ( formStatus === 'complete' && ! didCallOnPaymentComplete.current ) {
			debug( "form status is complete so I'm calling onPaymentComplete" );
			didCallOnPaymentComplete.current = true;
			onPaymentComplete( { paymentMethodId } );
		}
	}, [ formStatus, onPaymentComplete, paymentMethodId ] );

	// Create the registry automatically if it's not a prop
	const registryRef = useRef( registry );
	registryRef.current = registryRef.current || defaultRegistry;

	const value = useMemo(
		() => ( {
			allPaymentMethods: paymentMethods,
			paymentMethodId,
			setPaymentMethodId,
			showErrorMessage,
			showInfoMessage,
			showSuccessMessage,
			onEvent: onEvent || ( () => {} ),
			formStatus,
			setFormStatus,
		} ),
		[
			formStatus,
			onEvent,
			paymentMethodId,
			paymentMethods,
			setFormStatus,
			showErrorMessage,
			showInfoMessage,
			showSuccessMessage,
		]
	);

	// This error message cannot be translated because translation hasn't loaded yet.
	const errorMessage = 'Sorry, there was an error loading this page';
	const onError = useCallback(
		( error ) => onEvent?.( { type: 'PAGE_LOAD_ERROR', payload: error.message } ),
		[ onEvent ]
	);
	return (
		<CheckoutErrorBoundary errorMessage={ errorMessage } onError={ onError }>
			<CheckoutProviderPropValidator propsToValidate={ props } />
			<ThemeProvider theme={ theme || defaultTheme }>
				<RegistryProvider value={ registryRef.current }>
					<LocalizeProvider locale={ locale }>
						<LineItemsProvider items={ items } total={ total }>
							<CheckoutContext.Provider value={ value }>{ children }</CheckoutContext.Provider>
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
	onPaymentComplete: PropTypes.func.isRequired,
	showErrorMessage: PropTypes.func.isRequired,
	showInfoMessage: PropTypes.func.isRequired,
	showSuccessMessage: PropTypes.func.isRequired,
	onEvent: PropTypes.func,
	isLoading: PropTypes.bool,
};

function CheckoutProviderPropValidator( { propsToValidate } ) {
	const {
		locale,
		total,
		items,
		onPaymentComplete,
		showErrorMessage,
		showInfoMessage,
		showSuccessMessage,
		paymentMethods,
	} = propsToValidate;
	useEffect( () => {
		debug( 'propsToValidate', propsToValidate );

		validateArg( locale, 'CheckoutProvider missing required prop: locale' );
		validateArg( total, 'CheckoutProvider missing required prop: total' );
		validateTotal( total );
		validateArg( items, 'CheckoutProvider missing required prop: items' );
		validateLineItems( items );
		validateArg( paymentMethods, 'CheckoutProvider missing required prop: paymentMethods' );
		validatePaymentMethods( paymentMethods );
		validateArg( onPaymentComplete, 'CheckoutProvider missing required prop: onPaymentComplete' );
		validateArg( showErrorMessage, 'CheckoutProvider missing required prop: showErrorMessage' );
		validateArg( showInfoMessage, 'CheckoutProvider missing required prop: showInfoMessage' );
		validateArg( showSuccessMessage, 'CheckoutProvider missing required prop: showSuccessMessage' );
	}, [
		items,
		locale,
		onPaymentComplete,
		paymentMethods,
		propsToValidate,
		showErrorMessage,
		showInfoMessage,
		showSuccessMessage,
		total,
	] );
	return null;
}

export function useEvents() {
	const { onEvent } = useContext( CheckoutContext );
	if ( ! onEvent ) {
		throw new Error( 'useEvents can only be used inside a CheckoutProvider' );
	}
	return onEvent;
}

export function useMessages() {
	const { showErrorMessage, showInfoMessage, showSuccessMessage } = useContext( CheckoutContext );
	if ( ! showErrorMessage || ! showInfoMessage || ! showSuccessMessage ) {
		throw new Error( 'useMessages can only be used inside a CheckoutProvider' );
	}
	return { showErrorMessage, showInfoMessage, showSuccessMessage };
}
