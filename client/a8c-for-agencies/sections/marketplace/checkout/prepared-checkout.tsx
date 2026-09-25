import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import usePrepareCheckoutMutation from 'calypso/a8c-for-agencies/data/marketplace/use-prepare-checkout';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BillingDragonCheckout from '../billing-dragon-checkout';
import ClientCheckoutError from '../billing-dragon-checkout/checkout-error';
import ClientCheckoutPlaceholder from '../billing-dragon-checkout/checkout-placeholder';
import { SKIP_ACTIVE_CART_QUERY_ARG } from '../lib/prepared-checkout/get-prepared-checkout-request';
import type { PreparedCheckoutRequestResult } from '../lib/prepared-checkout/get-prepared-checkout-request';

const RELOAD_SOURCE = 'reload';

/**
 * Prepared checkout: an external system (for example Pressable) sent the user
 * here with a signed request. Forward it once to the source's wpcom endpoint,
 * which saves the buyer's no-site cart, then hand the Billing Dragon checkout
 * that cart in prepared mode. The signed params are replaced in the address bar
 * by `skip_active_cart=1` so a reload shows the prepared cart without
 * preparing again and never rebuilds the cart from Marketplace selections.
 */
export default function PreparedCheckout( {
	request,
}: {
	request: PreparedCheckoutRequestResult;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { mutate, status, data, error } = usePrepareCheckoutMutation();
	const hasPrepared = useRef( false );

	const sourceId = request.status === 'ready' ? request.request.source.id : undefined;

	useEffect( () => {
		if ( request.status !== 'ready' || hasPrepared.current ) {
			return;
		}
		// Prepare exactly once per page load; the params come from the URL and do not change.
		hasPrepared.current = true;
		mutate( request.request );
	}, [ request, mutate ] );

	useEffect( () => {
		if ( status === 'success' ) {
			// Same idiom as useClearCartOnCheckoutSuccess: page.replace() would abort the render.
			window.history.replaceState(
				null,
				'',
				`${ A4A_MARKETPLACE_CHECKOUT_LINK }?${ SKIP_ACTIVE_CART_QUERY_ARG }=1`
			);
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_prepared_checkout_prepared', {
					source: sourceId,
				} )
			);
		} else if ( status === 'error' ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_prepared_checkout_failed', {
					source: sourceId,
					error_code: error?.code,
				} )
			);
		}
	}, [ status, error, dispatch, sourceId ] );

	if ( request.status === 'reload' ) {
		return (
			<BillingDragonCheckout
				cartItems={ [] }
				withA8cLogo={ false }
				shouldClearCartOnSuccess={ false }
				preparedCart={ { source: RELOAD_SOURCE } }
			/>
		);
	}

	if ( request.status === 'unknown_source' ) {
		return (
			<ClientCheckoutError
				title={ translate( 'This checkout link is not supported.' ) }
				message={ translate( 'Please return to where you started this purchase and try again.' ) }
			/>
		);
	}

	if ( request.status === 'incomplete' ) {
		return (
			<ClientCheckoutError
				title={ translate( 'This checkout link is incomplete.' ) }
				message={ translate( 'Please return to where you started this purchase and try again.' ) }
			/>
		);
	}

	if ( request.status !== 'ready' ) {
		// 'none' never reaches this component; CheckoutV2 renders the normal checkout instead.
		return null;
	}

	if ( status === 'error' ) {
		return (
			<ClientCheckoutError
				title={ translate( 'We could not prepare this checkout.' ) }
				message={ error?.message ?? translate( 'Please try again.' ) }
			/>
		);
	}

	if ( status === 'success' && data ) {
		return (
			<BillingDragonCheckout
				cartItems={ [] }
				withA8cLogo={ false }
				shouldClearCartOnSuccess={ false }
				preparedCart={ { products: data.products, source: request.request.source.id } }
			/>
		);
	}

	return <ClientCheckoutPlaceholder />;
}
