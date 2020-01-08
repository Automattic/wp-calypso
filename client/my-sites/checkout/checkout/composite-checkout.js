/**
 * External dependencies
 */
import page from 'page';
import wp from 'lib/wp';
import React, { useMemo, useEffect, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';
import { WPCheckout, useWpcomStore, useShoppingCart } from '@automattic/composite-checkout-wpcom';
import { CheckoutProvider, createRegistry } from '@automattic/composite-checkout';

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
import { useCreatePaymentMethods } from './composite-checkout-payment-methods';
import notices from 'notices';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';

const debug = debugFactory( 'calypso:composite-checkout' );

const registry = createRegistry();
const { select } = registry;

const wpcom = wp.undocumented();

// Aliasing getCart and setCart explicitly bound to wpcom is
// required here; otherwise we get `this is not defined` errors.
const wpcomGetCart = ( ...args ) => wpcom.getCart( ...args );
const wpcomSetCart = ( ...args ) => wpcom.setCart( ...args );

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	product,
	getCart,
	setCart,
	allowedPaymentMethods,
	// TODO: handle these also
	// purchaseId,
	// couponCode,
} ) {
	const translate = useTranslate();
	const planSlug = useSelector( state => getUpgradePlanSlugFromPath( state, siteId, product ) );
	const isJetpackNotAtomic = useSelector(
		state => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);

	const onPaymentComplete = useCallback( () => {
		debug( 'payment completed successfully' );
		// TODO: determine which thank-you page to visit
		page.redirect( `/checkout/thank-you/${ siteId }/` );
	}, [ siteId ] );

	const showErrorMessage = useCallback(
		error => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ) );
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( message => {
		debug( 'info', message );
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( message => {
		debug( 'success', message );
		notices.success( message );
	}, [] );

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
	} = useShoppingCart( siteSlug, setCart || wpcomSetCart, getCart || wpcomGetCart );
	const { registerStore } = registry;
	useWpcomStore( registerStore, handleCheckoutEvent );

	const errorMessages = useMemo( () => errors.map( error => error.message ), [ errors ] );
	useDisplayErrors( errorMessages, showErrorMessage );

	useAddProductToCart( planSlug, isJetpackNotAtomic, addItem );

	const itemsForCheckout = items.length ? [ ...items, tax ] : [];
	debug( 'items for checkout', itemsForCheckout );

	// Payment methods must be created inside the component so their stores are
	// re-created when the checkout unmounts and remounts.
	const paymentMethods = useCreatePaymentMethods( {
		allowedPaymentMethods,
		select,
		registerStore,
		wpcom,
		credits,
		total,
	} );

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
	siteSlug: PropTypes.string,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	product: PropTypes.string,
	getCart: PropTypes.func,
	setCart: PropTypes.func,
	allowedPaymentMethods: PropTypes.array,
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
