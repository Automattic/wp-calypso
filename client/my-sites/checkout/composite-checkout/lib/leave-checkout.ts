import debugFactory from 'debug';
import { useDispatch } from 'react-redux';
import { navigate } from 'calypso/lib/navigate';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const debug = debugFactory( 'calypso:leave-checkout' );

export const leaveCheckout = ( {
	siteSlug,
	jetpackCheckoutBackUrl,
	previousPath,
	dispatch,
	createUserAndSiteBeforeTransaction,
}: {
	siteSlug?: string;
	jetpackCheckoutBackUrl?: string;
	previousPath?: string;
	dispatch: ReturnType< typeof useDispatch >;
	createUserAndSiteBeforeTransaction?: boolean;
} ): void => {
	dispatch( recordTracksEvent( 'calypso_masterbar_close_clicked' ) );
	debug( 'leaving checkout with args', {
		siteSlug,
		jetpackCheckoutBackUrl,
		previousPath,
		createUserAndSiteBeforeTransaction,
	} );

	if ( jetpackCheckoutBackUrl ) {
		window.location.href = jetpackCheckoutBackUrl;
		return;
	}

	let closeUrl = siteSlug ? '/plans/' + siteSlug : '/start';

	if (
		previousPath &&
		'' !== previousPath &&
		previousPath !== window.location.href &&
		! previousPath.includes( '/checkout/' )
	) {
		closeUrl = previousPath;
	}

	try {
		const searchParams = new URLSearchParams( window.location.search );

		if ( searchParams.has( 'signup' ) ) {
			clearSignupDestinationCookie();
		}

		if ( createUserAndSiteBeforeTransaction ) {
			try {
				window.localStorage.removeItem( 'shoppingCart' );
				window.localStorage.removeItem( 'siteParams' );
			} catch ( err ) {}

			// We use window.location instead of page.redirect() so that if the user already has an account and site at
			// this point, then window.location will reload with the cookies applied and takes to the /plans page.
			// (page.redirect() will take to the log in page instead).
			window.location.href = closeUrl;
			return;
		}

		if ( searchParams.has( 'cancel_to' ) ) {
			const cancelPath = searchParams.get( 'cancel_to' ) ?? '';
			// Only allow redirecting to relative paths.
			if ( cancelPath.match( /^\/(?!\/)/ ) ) {
				navigate( cancelPath );
				return;
			}
		}

		// Some places that open checkout (eg: purchase page renewals) return the
		// user there after checkout by putting the previous page's path in the
		// `redirect_to` query param. When leaving checkout via the close button,
		// we probably want to return to that location also.
		if ( searchParams.has( 'redirect_to' ) ) {
			const redirectPath = searchParams.get( 'redirect_to' ) ?? '';
			// Only allow redirecting to relative paths.
			if ( redirectPath.match( /^\/(?!\/)/ ) ) {
				navigate( redirectPath );
				return;
			}
		}
	} catch ( error ) {
		// Silently ignore query string errors (eg: which may occur in IE since it doesn't support URLSearchParams).
		// eslint-disable-next-line no-console
		console.error( 'Error getting query string in close button' );
	}

	navigate( closeUrl );
};
