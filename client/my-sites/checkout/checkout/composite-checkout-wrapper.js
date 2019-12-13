/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckoutProvider } from '@automattic/composite-checkout';
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

const debug = debugFactory( 'composite-checkout-wpcom:wp-checkout-wrapper' );

// These are used only for redirect payment methods
// TODO: determine what these should be
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Called when the store is changed.
const handleCheckoutEvent = () => () => {
	// TODO: record stats
};

export function CompositeCheckoutWrapper( {
	siteSlug,
	planSlug,
	isJetpackNotAtomic,
	setCart,
	getCart,
	availablePaymentMethods,
	registry,
	siteId,
	onSuccess,
	onFailure,
} ) {
	const { items, tax, total, removeItem, addItem, changePlanLength } = useShoppingCart(
		siteSlug,
		setCart,
		getCart
	);
	const dispatch = useDispatch();
	const plan = useSelector( state => getPlanBySlug( state, planSlug ) );

	const { select, subscribe, registerStore } = registry;
	useWpcomStore( registerStore );

	useEffect( () => {
		debug( 'subscribing to composite-checkout events' );
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

	// Add product if requested in the URL
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

	const itemsForCheckout = items.length ? [ ...items, tax ] : [];
	debug( 'items for checkout', itemsForCheckout );

	return (
		<CheckoutProvider
			locale={ 'en-us' }
			items={ itemsForCheckout }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ availablePaymentMethods }
			registry={ registry }
		>
			<WPCheckout
				removeItem={ removeItem }
				changePlanLength={ changePlanLength }
				siteId={ siteId }
			/>
		</CheckoutProvider>
	);
}

CompositeCheckoutWrapper.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	registry: PropTypes.object.isRequired,
	siteSlug: PropTypes.string,
	setCart: PropTypes.func.isRequired,
	getCart: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	planSlug: PropTypes.string,
	isJetpackNotAtomic: PropTypes.bool,
};

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
