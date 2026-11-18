import {
	isTailoredSignupFlow,
	SITE_MIGRATION_FLOW,
	STATIC_SITE_IMPORT_FLOW,
} from '@automattic/onboarding';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import debugFactory from 'debug';
import { dashboardOrigins } from 'calypso/dashboard/utils/link';
import { getUrlOnOrigins } from 'calypso/dashboard/utils/url';
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
		! [ SITE_MIGRATION_FLOW, STATIC_SITE_IMPORT_FLOW ].includes( signupFlowName )
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

		if ( searchParams.has( 'history_back' ) ) {
			window.history.back();
			return;
		}

		if ( searchParams.has( 'cancel_to' ) ) {
			const cancelPath = searchParams.get( 'cancel_to' ) ?? '';

			const allowedUrl = getUrlOnOrigins(
				cancelPath,
				[ window.location.origin, ...dashboardOrigins(), ...jetpackCloudOrigins( cancelPath ) ],
				window.location.href
			);
			if ( allowedUrl ) {
				// We use window.location.href instead of navigate() because navigate() uses page.show()
				// which silently fails for /setup/ Stepper routes. Since we're leaving checkout entirely,
				// the SPA optimization from navigate() provides no meaningful benefit.
				window.location.href = allowedUrl;
				return;
			}
			// If cancel_to is invalid (e.g., external URL), fall through to default close URL.
		}
	} catch ( error ) {
		// Silently ignore query string errors (eg: which may occur in IE since it doesn't support URLSearchParams).
		// eslint-disable-next-line no-console
		console.error( 'Error getting query string in close button' );
	}

	navigate( closeUrl );
};

/**
 * Jetpack Cloud sends its purchases pages here for renewals and upgrades, and
 * `cancel_to` points back at them. The local host takes any port, since its dev
 * server needn't share this one's (`start-jetpack-cloud-p` runs on 3001).
 */
function jetpackCloudOrigins( url: string ) {
	let port = '';
	try {
		port = new URL( url ).port;
	} catch {}
	return [ 'https://cloud.jetpack.com', `http://jetpack.cloud.localhost${ port && `:${ port }` }` ];
}
