import { useDebugValue } from 'react';
import { useSelector } from 'react-redux';
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
	const isNoSiteCart =
		isJetpackCheckout ||
		( ! isLoggedOutCart &&
			currentUrlPath.includes( '/checkout/no-site' ) &&
			'no-user' === searchParams.get( 'cart' ) );

	const cartKey = getCartKey( {
		selectedSite,
		isLoggedOutCart,
		isNoSiteCart,
	} );
	useDebugValue( `cart key is ${ cartKey }` );
	useDebugValue( `site ID ${ selectedSite?.ID }` );
	return cartKey;
}
