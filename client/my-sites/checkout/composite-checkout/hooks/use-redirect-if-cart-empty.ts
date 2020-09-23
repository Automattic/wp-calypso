/**
 * External dependencies
 */
import { useEffect } from 'react';
import page from 'page';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:composite-checkout:use-redirect-if-cart-empty' );

export default function useRedirectIfCartEmpty< T >(
	items: Array< T >,
	redirectUrl: string,
	isLoading: boolean,
	errors: string[],
	createUserAndSiteBeforeTransaction: boolean
) {
	useEffect( () => {
		if ( ! isLoading && items.length === 0 && errors.length === 0 ) {
			debug( 'cart is empty and not still loading; redirecting...' );
			if ( createUserAndSiteBeforeTransaction ) {
				window.localStorage.removeItem( 'shoppingCart' );
				window.localStorage.removeItem( 'siteParams' );

				// We use window.location instead of page.redirect() so that if the user already has an account and site at
				// this point, then window.location will reload with the cookies applied and takes to the /plans page.
				// (page.redirect() will take to the log in page instead).
				window.location.href = redirectUrl;
				return;
			}
			page.redirect( redirectUrl );
			return;
		}
	}, [ redirectUrl, items, isLoading, errors, createUserAndSiteBeforeTransaction ] );
}
