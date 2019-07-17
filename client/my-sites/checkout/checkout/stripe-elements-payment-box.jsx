/** @format */

/**
 * External dependencies
 */
import { loadScript } from '@automattic/load-script';
import debugFactory from 'debug';
import React, { useEffect, useState } from 'react';
import { localize } from 'i18n-calypso';
import { StripeProvider, Elements } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import { getStripeConfiguration } from 'lib/store-transactions';
import CreditCardPaymentBox from './credit-card-payment-box';

const debug = debugFactory( 'calypso:stripe-elements-payment-box' );

function useStripeJs( stripeConfiguration ) {
	const [ stripeJs, setStripeJs ] = useState( null );
	useEffect( () => {
		if ( ! stripeConfiguration ) {
			return;
		}
		if ( window.Stripe ) {
			debug( 'stripe.js already loaded' );
			setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
			return;
		}
		debug( 'loading stripe.js...' );
		loadScript( stripeConfiguration.js_url, function( error ) {
			if ( error ) {
				debug( 'stripe.js script ' + error.src + ' failed to load.' );
				return;
			}
			debug( 'stripe.js loaded!' );
			setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
		} );
	}, [ stripeConfiguration ] );
	return stripeJs;
}

function useStripeConfiguration( country ) {
	const [ stripeConfiguration, setStripeConfiguration ] = useState();
	useEffect( () => {
		getStripeConfiguration( { country } ).then( configuration =>
			setStripeConfiguration( configuration )
		);
	}, [ country ] );
	return stripeConfiguration;
}

export function StripeElementsPaymentBox( {
	translate,
	cart,
	children,
	selectedSite,
	initialCard,
	countriesList,
	onSubmit,
	transaction,
	presaleChatAvailable,
	cards,
} ) {
	// TODO: send the country to useStripeConfiguration
	const stripeConfiguration = useStripeConfiguration();
	const stripeJs = useStripeJs( stripeConfiguration );
	return (
		<StripeProvider stripe={ stripeJs }>
			<Elements>
				<CreditCardPaymentBox
					translate={ translate }
					cards={ cards }
					transaction={ transaction }
					cart={ cart }
					countriesList={ countriesList }
					initialCard={ initialCard }
					selectedSite={ selectedSite }
					onSubmit={ onSubmit }
					transactionStep={ transaction.step }
					presaleChatAvailable={ presaleChatAvailable }
					stripeConfiguration={ stripeConfiguration }
				>
					{ children }
				</CreditCardPaymentBox>
			</Elements>
		</StripeProvider>
	);
}
export default localize( StripeElementsPaymentBox );
