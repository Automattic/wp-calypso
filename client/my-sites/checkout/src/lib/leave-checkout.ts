import { isTailoredSignupFlow, HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import {
	clearSignupDestinationCookie,
	getSignupCompleteFlowName,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import { sendMessageToOpener } from './popup';

const debug = debugFactory( 'calypso:leave-checkout' );

const getCloseURL = ( {
	userHasClearedCart,
	previousPath,
	siteSlug,
}: {
	userHasClearedCart: boolean;
	previousPath?: string;
	siteSlug?: string;
} ): string => {
	if (
		previousPath &&
		previousPath !== '' &&
		previousPath !== window.location.href &&
		! previousPath.includes( '/checkout/' )
	) {
		/* Regex to match /domains/add/abc123/email/def456? */
		const emailUpsellRegex = /\/domains\/add\/[^/]+\/email\/[^/]+(\?|\/|$)/;

		if ( userHasClearedCart && emailUpsellRegex.test( previousPath ) ) {
			return '/domains/add/' + siteSlug;
		}
		return previousPath;
	}

	return siteSlug ? '/plans/' + siteSlug : '/start';
};

export const leaveCheckout = ( {
	siteSlug,
	forceCheckoutBackUrl,
	previousPath,
	tracksEvent,
	createUserAndSiteBeforeTransaction,
	userHasClearedCart = false,
}: {
	siteSlug?: string;
	forceCheckoutBackUrl?: string;
	previousPath?: string;
	tracksEvent: string;
	createUserAndSiteBeforeTransaction?: boolean;
	userHasClearedCart?: boolean;
} ): void => {
	recordTracksEvent( tracksEvent );
	debug( 'leaving checkout with args', {
		siteSlug,
		forceCheckoutBackUrl,
		previousPath,
		createUserAndSiteBeforeTransaction,
	} );

	const signupFlowName = getSignupCompleteFlowName();
	const redirectToParam = getQueryArg( window.location.href, 'redirect_to' );
	const launchpadURLRegex = /^\/setup\/[a-z][a-z\-_]*[a-z]\/launchpad\b/g;
	const launchpadURLRegexMatch = redirectToParam?.toString().match( launchpadURLRegex );

	if (
		siteSlug &&
		sendMessageToOpener( siteSlug, 'checkoutCancelled' ) &&
		! [ HOSTED_SITE_MIGRATION_FLOW ].includes( signupFlowName )
	) {
		return;
	}

	if ( isTailoredSignupFlow( signupFlowName ) ) {
		const urlFromCookie = addQueryArgs( retrieveSignupDestination(), { skippedCheckout: 1 } );
		if ( urlFromCookie ) {
			window.location.assign( urlFromCookie );
		}
	}

	if ( redirectToParam && launchpadURLRegexMatch ) {
		const launchpadUrl = addQueryArgs( redirectToParam?.toString(), { skippedCheckout: 1 } );
		window.location.assign( launchpadUrl );
		return;
	}

	if ( forceCheckoutBackUrl ) {
		window.location.href = forceCheckoutBackUrl;
		return;
	}

	const closeUrl = getCloseURL( { userHasClearedCart, previousPath, siteSlug } );

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
			if ( isRelativeUrl( cancelPath ) ) {
				navigate( cancelPath );
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

export function isRelativeUrl( url: string ) {
	try {
		return new URL( url, window.location.href ).origin === window.location.origin;
	} catch {
		return false;
	}
}
