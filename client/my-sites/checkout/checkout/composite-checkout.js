/**
 * External dependencies
 */
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CheckoutProvider, createFullCreditsMethod } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';
import { WPCheckout, useWpcomStore, useShoppingCart } from '@automattic/composite-checkout-wpcom';

/**
 * Internal dependencies
 */
import {
	conciergeSessionItem,
	domainMapping,
	planItem,
	themeItem,
	jetpackProductItem,
} from 'lib/cart-values/cart-items';
import { requestPlans } from 'state/plans/actions';
import { getPlanBySlug } from 'state/plans/selectors';

const debug = debugFactory( 'calypso:composite-checkout' );

export function CompositeCheckout( {
	siteSlug,
	planSlug,
	isJetpackNotAtomic,
	setCart,
	getCart,
	availablePaymentMethods,
	registry,
	siteId,
	onPaymentComplete,
	showErrorMessage,
	showInfoMessage,
	showSuccessMessage,
} ) {
	const {
		items,
		tax,
		total,
		credits,
		removeItem,
		addItem,
		changePlanLength,
		errors,
		isLoading,
	} = useShoppingCart( siteSlug, setCart, getCart );
	const { registerStore } = registry;
	useWpcomStore( registerStore, handleCheckoutEvent );

	const errorMessages = useMemo( () => errors.map( error => error.message ), [ errors ] );
	useDisplayErrors( errorMessages, showErrorMessage );

	useAddProductToCart( planSlug, isJetpackNotAtomic, addItem );

	const itemsForCheckout = items.length ? [ ...items, tax ] : [];
	debug( 'items for checkout', itemsForCheckout );

	const fullCreditsPaymentMethod = useMemo(
		() => ( credits >= total.amount ? createFullCreditsMethod() : null ),
		[ credits, total.amount ]
	);

	const paymentMethods = useMemo(
		() => [ ...availablePaymentMethods, fullCreditsPaymentMethod ].filter( Boolean ),
		[ availablePaymentMethods, fullCreditsPaymentMethod ]
	);

	return (
		<CheckoutProvider
			locale={ 'en-us' }
			items={ itemsForCheckout }
			total={ total }
			onPaymentComplete={ onPaymentComplete }
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			onEvent={ handleCheckoutEvent }
			paymentMethods={ paymentMethods }
			registry={ registry }
			isLoading={ isLoading }
		>
			<WPCheckout
				removeItem={ removeItem }
				changePlanLength={ changePlanLength }
				siteId={ siteId }
			/>
		</CheckoutProvider>
	);
}

CompositeCheckout.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	registry: PropTypes.object.isRequired,
	siteSlug: PropTypes.string,
	setCart: PropTypes.func.isRequired,
	getCart: PropTypes.func.isRequired,
	onPaymentComplete: PropTypes.func.isRequired,
	showErrorMessage: PropTypes.func.isRequired,
	showInfoMessage: PropTypes.func.isRequired,
	showSuccessMessage: PropTypes.func.isRequired,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	planSlug: PropTypes.string,
	isJetpackNotAtomic: PropTypes.bool,
};

function useAddProductToCart( planSlug, isJetpackNotAtomic, addItem ) {
	const dispatch = useDispatch();
	const plan = useSelector( state => getPlanBySlug( state, planSlug ) );

	useEffect( () => {
		if ( ! planSlug ) {
			return;
		}
		if ( ! plan ) {
			debug( 'there is a request to add a plan but no plan was found', planSlug );
			dispatch( requestPlans() );
			return;
		}
		debug( 'adding item as requested in url', { planSlug, plan, isJetpackNotAtomic } );
		addItem( createItemToAddToCart( { planSlug, plan, isJetpackNotAtomic } ) );
	}, [ dispatch, planSlug, plan, isJetpackNotAtomic, addItem ] );
}

function useDisplayErrors( errors, displayError ) {
	useEffect( () => {
		errors.map( displayError );
	}, [ errors, displayError ] );
}

function createItemToAddToCart( { planSlug, plan, isJetpackNotAtomic } ) {
	let cartItem, cartMeta;

	if ( planSlug ) {
		cartItem = planItem( planSlug );
		cartItem.product_id = plan.product_id;
	}

	if ( planSlug.startsWith( 'theme' ) ) {
		cartMeta = planSlug.split( ':' )[ 1 ];
		cartItem = themeItem( cartMeta );
	}

	if ( planSlug.startsWith( 'domain-mapping' ) ) {
		cartMeta = planSlug.split( ':' )[ 1 ];
		cartItem = domainMapping( { domain: cartMeta } );
	}

	if ( planSlug.startsWith( 'concierge-session' ) ) {
		// TODO: prevent adding a conciergeSessionItem if one already exists
		cartItem = conciergeSessionItem();
	}

	if ( planSlug.startsWith( 'jetpack_backup' ) && isJetpackNotAtomic ) {
		cartItem = jetpackProductItem( planSlug );
	}

	cartItem.extra = { ...cartItem.extra, context: 'calypstore' };

	return cartItem;
}

function handleCheckoutEvent( action ) {
	debug( 'checkout event', action );
	// TODO: record stats
}
