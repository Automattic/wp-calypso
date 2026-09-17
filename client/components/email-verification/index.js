import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { sendVerificationSignal } from 'calypso/lib/user/verification-checker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

/**
 * Page middleware
 */

function parseVerificationParams( query ) {
	const verified = query.verified;
	const newEmailResult = query.new_email_result;

	const isEmailChangeComplete = newEmailResult === '1';
	const isEmailVerificationComplete = verified === '1';
	const emailChangeFailed = newEmailResult === '0';
	const emailVerificationFailed = verified === '0';

	return {
		isEmailChangeComplete,
		isEmailVerificationComplete,
		emailChangeFailed,
		emailVerificationFailed,
		hasValidResult:
			isEmailChangeComplete ||
			isEmailVerificationComplete ||
			emailChangeFailed ||
			emailVerificationFailed,
		verified,
		newEmailResult,
		newEmailError: query.new_email_error,
	};
}

export default function emailVerification( context, next ) {
	const params = parseVerificationParams( context.query );

	if ( ! params.hasValidResult ) {
		next();
		return;
	}

	if ( redirectToOptedInDashboard( context, params ) ) {
		return;
	}

	handleV1Logic( context, params );

	// Once: a second hand-off runs the rest of the chain again, past a redirect meant to end it.
	next();
}

function buildDashboardRedirectUrl( { verified, newEmailResult, newEmailError } ) {
	bumpStat( 'dashboard-redirect', 'email-verification' );
	// Not /me/profile: it redirects here without carrying the query arguments.
	const redirectUrl = dashboardLink( '/me/account' );
	if ( verified ) {
		return addQueryArgs( redirectUrl, { verified } );
	}
	if ( newEmailResult ) {
		return addQueryArgs( redirectUrl, {
			new_email_result: newEmailResult,
			new_email_error: newEmailError,
		} );
	}
	return redirectUrl;
}

/**
 * Sends the result to the dashboard the user has opted in to, if they have. Returns true when it
 * has done so, and the result is no longer this dashboard's to show.
 *
 * /me/account?verified=1 → <the dashboard they are on>/me/account?verified=1
 */
function redirectToOptedInDashboard( context, params ) {
	if ( ! [ '/me/account', '/settings/account' ].includes( context.pathname ) ) {
		return false;
	}

	let state = context.store.getState();

	const arePreferencesLoaded = ( storeState ) =>
		! storeState.preferences.fetching && storeState.preferences.remoteValues !== null;

	if ( ! arePreferencesLoaded( state ) ) {
		const unsubscribe = context.store.subscribe( () => {
			state = context.store.getState();

			if ( arePreferencesLoaded( state ) ) {
				unsubscribe();

				if ( hasDashboardOptIn( state ) ) {
					window.location.href = buildDashboardRedirectUrl( params );
				}
			}
		} );

		setTimeout( () => unsubscribe(), 10000 ); // 10 seconds

		return false;
	}

	if ( hasDashboardOptIn( state ) ) {
		window.location.href = buildDashboardRedirectUrl( params );
		return true;
	}

	return false;
}

// The notice state seems to be cleared on page load, so it is dispatched a moment afterwards.
const announce = ( context, notice ) => {
	setTimeout( () => context.store.dispatch( notice ), 500 );
};

const invalidLinkMessage = () =>
	i18n.translate(
		'The email verification link is invalid or has expired. Please request a new one.'
	);

// Unknown or absent reads as it did before, so the server can start sending a reason later.
function emailChangeFailureMessage( newEmailError ) {
	if ( newEmailError === 'email_in_use' ) {
		return i18n.translate(
			'That email address is already used by another WordPress.com account. Try a different address.'
		);
	}
	return invalidLinkMessage();
}

function handleV1Logic( context, params ) {
	// This path forwards these on rather than consuming them; announcing here too says it twice.
	if ( params.newEmailResult && context.pathname === '/settings/account' ) {
		return;
	}

	if ( params.isEmailVerificationComplete ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'verified' ) );
		try {
			sendVerificationSignal();
		} catch {}
		announce( context, successNotice( i18n.translate( 'Email confirmed!' ), { duration: 10000 } ) );
	} else if ( params.isEmailChangeComplete ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'new_email_result' ) );
		const message = i18n.translate(
			'Email address updated. Make sure you update your contact information for any registered domains.'
		);
		announce(
			context,
			successNotice( message, {
				duration: 10000,
				button: i18n.translate( 'Update' ),
				href: '/domains/manage?site=all&action=edit-contact-email',
				onClick: () => {
					context.store.dispatch(
						recordTracksEvent( 'calypso_domain_contact_email_update_notice_click', {
							link_text: 'Update',
							domain: null,
						} )
					);
				},
			} )
		);
	} else if ( params.emailVerificationFailed ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'verified' ) );
		announce( context, errorNotice( invalidLinkMessage(), { duration: 10000 } ) );
	} else if ( params.emailChangeFailed ) {
		context.page.replace(
			removeQueryArgs( context.canonicalPath, 'new_email_result', 'new_email_error' )
		);
		announce(
			context,
			errorNotice( emailChangeFailureMessage( params.newEmailError ), { duration: 10000 } )
		);
	}
}
