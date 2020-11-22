/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';

const debug = debugFactory( 'calypso:composite-checkout:use-redirect-if-cart-empty' );

export default function useRedirectIfCartEmpty< T >(
	doNotRedirect: boolean,
	items: Array< T >,
	redirectUrl: string,
	createUserAndSiteBeforeTransaction: boolean
): boolean {
	const didRedirect = useRef< boolean >( false );
	useEffect( () => {
		if ( didRedirect.current || doNotRedirect ) {
			return;
		}
		if ( items.length === 0 ) {
			didRedirect.current = true;
			debug( 'cart is empty and not still loading; redirecting...' );

			debug( 'Before redirect, first clear redirect url cookie' );
			clearSignupDestinationCookie();

			if ( createUserAndSiteBeforeTransaction ) {
				try {
					window.localStorage.removeItem( 'shoppingCart' );
					window.localStorage.removeItem( 'siteParams' );
				} catch ( err ) {}

				// We use window.location instead of page.redirect() so that if the user already has an account and site at
				// this point, then window.location will reload with the cookies applied and takes to the /plans page.
				// (page.redirect() will take to the log in page instead).
				window.location.href = redirectUrl;
				return;
			}
			page.redirect( redirectUrl );
			return;
		}
	}, [ redirectUrl, items, doNotRedirect, createUserAndSiteBeforeTransaction ] );
	return didRedirect.current;
}
