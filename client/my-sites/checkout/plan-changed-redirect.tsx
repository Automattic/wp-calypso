import { isPlan } from '@automattic/calypso-products';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import Loading from 'calypso/components/loading';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

function redirectToPurchaseSettings( purchaseId: number ) {
	const url = addQueryArgs( dashboardLink( `/me/billing/purchases/${ purchaseId }` ), {
		plan_changed: 'true',
	} );
	window.location.replace( url );
}

function redirectToPurchasesList() {
	const url = addQueryArgs( dashboardLink( '/me/billing/purchases' ), {
		plan_changed: 'true',
	} );
	window.location.replace( url );
}

/**
 * Intermediate loading page after a plan-change checkout.
 *
 * Resolves the new plan's purchase ID from the user's purchases, then
 * redirects to the Dashboard purchase settings page with a success notice.
 * Uses `window.location.replace()` so the loading page is removed from
 * browser history — pressing "back" on purchase settings skips it.
 */
export default function PlanChangedRedirect() {
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const purchases = useSelector( getUserPurchases ) as Purchase[] | null;
	const hasLoadedPurchases = useSelector( hasLoadedUserPurchasesFromServer );
	const isFetching = useSelector( isFetchingUserPurchases );
	const [ hasRedirected, setHasRedirected ] = useState( false );

	// Fetch purchases on mount (fresh page load after checkout).
	useEffect( () => {
		if ( userId ) {
			dispatch( fetchUserPurchases( userId ) );
		}
	}, [ dispatch, userId ] );

	// Once purchases are loaded, find the plan and redirect.
	useEffect( () => {
		if ( hasRedirected || isFetching || ! hasLoadedPurchases || ! purchases ) {
			return;
		}

		// Find the active plan purchase for this site.
		// Try matching by siteSlug first, fall back to matching any active plan.
		const planPurchase = purchases.find( ( p: Purchase ) => {
			if ( ! isPlan( p ) ) {
				return false;
			}
			// Skip expired purchases — we want the NEW plan, not the old expired one.
			if ( p.expiryStatus === 'expired' ) {
				return false;
			}
			// Match by site slug if available.
			if ( siteSlug ) {
				return p.domain === siteSlug;
			}
			return true;
		} );

		setHasRedirected( true );

		if ( planPurchase ) {
			redirectToPurchaseSettings( planPurchase.id );
		} else {
			redirectToPurchasesList();
		}
	}, [ hasRedirected, hasLoadedPurchases, isFetching, purchases, siteSlug ] );

	// Safety fallback — if nothing happens after 15s, go to purchases list.
	useEffect( () => {
		const timeout = setTimeout( () => {
			if ( ! hasRedirected ) {
				setHasRedirected( true );
				redirectToPurchasesList();
			}
		}, 15000 );

		return () => clearTimeout( timeout );
	}, [ hasRedirected ] );

	return <Loading title={ __( 'Updating your plan…' ) } />;
}
