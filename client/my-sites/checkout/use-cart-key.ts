import { useDebugValue } from 'react';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCartKey from './get-cart-key';

export default function useCartKey(): ReturnType< typeof getCartKey > {
	const selectedSite = useSelector( getSelectedSite );
	const isLoggedOutCart = ! useSelector( isUserLoggedIn );
	const currentUrlPath = window.location.pathname;
	const searchParams = new URLSearchParams( window.location.search );
	const jetpackPurchaseToken = searchParams.has( 'purchasetoken' );
	const jetpackPurchaseNonce = searchParams.has( 'purchaseNonce' );
	const isJetpackCheckout =
		currentUrlPath.includes( '/checkout/jetpack' ) &&
		isLoggedOutCart &&
		( !! jetpackPurchaseToken || !! jetpackPurchaseNonce );
	const isAkismetSitelessCheckout =
		currentUrlPath.includes( '/checkout/akismet' ) && isLoggedOutCart;
	const isMarketplaceSitelessCheckout =
		currentUrlPath.includes( '/checkout/marketplace' ) && isLoggedOutCart;
	const isUnifiedSitelessCheckout =
		currentUrlPath.includes( '/checkout/unified' ) && isLoggedOutCart;
	const isA4ASitelessCheckout =
		isA8CForAgencies() &&
		! selectedSite &&
		( currentUrlPath.includes( '/marketplace/checkout' ) ||
			currentUrlPath.includes( '/client/checkout' ) );
	const isNoSiteCart =
		isJetpackCheckout ||
		isAkismetSitelessCheckout ||
		isMarketplaceSitelessCheckout ||
		isUnifiedSitelessCheckout ||
		( ! isLoggedOutCart &&
			currentUrlPath.includes( '/checkout/no-site' ) &&
			'no-user' === searchParams.get( 'cart' ) );

	const cartKey = getCartKey( {
		selectedSite: isA4ASitelessCheckout ? null : selectedSite,
		isLoggedOutCart,
		isNoSiteCart,
	} );
	useDebugValue( `cart key is ${ cartKey }` );
	useDebugValue( `site ID ${ selectedSite?.ID }` );
	return cartKey;
}
