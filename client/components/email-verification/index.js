import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import { sendVerificationSignal } from 'calypso/lib/user/verification-checker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { hasHostingDashboardOptIn } from 'calypso/state/sites/selectors/has-hosting-dashboard-opt-in';

/**
 * Page middleware
 */

// Parse email verification params from query
function parseVerificationParams( query ) {
	const verified = query.verified;
	const newEmailResult = query.new_email_result;

	return {
		isEmailChangeComplete: newEmailResult === '1',
		isEmailVerificationComplete: verified === '1',
		emailChangeFailed: newEmailResult === '0',
		emailVerificationFailed: verified === '0',
		hasAnyParam: !! ( newEmailResult || verified ),
		verified,
		newEmailResult,
	};
}

export default function emailVerification( context, next ) {
	const params = parseVerificationParams( context.query );

	if ( ! params.hasAnyParam ) {
		next();
		return;
	}

	// Redirect users to v2 if they opted in to the Hosting Dashboard
	if ( shouldRedirectToV2( context, next, params ) ) {
		return;
	}

	// Fallback to v1 logic
	handleV1Logic( context, next, params );

	next();
}

// Helper function to build redirect URL
function buildV2RedirectUrl( verified, newEmailResult ) {
	let redirectUrl = '/v2/me/profile';
	if ( verified ) {
		redirectUrl += `?verified=${ verified }`;
	} else if ( newEmailResult ) {
		redirectUrl += `?new_email_result=${ newEmailResult }`;
	}
	return redirectUrl;
}

/**
 * v2
 * Redirect to v2 for success and error cases.
 *
 * Examples:
 * /me/account?verified=1 → /v2/me/profile?verified=1
 * /me/account?new_email_result=1 → /v2/me/profile?new_email_result=1
 */
function shouldRedirectToV2( context, next, params ) {
	const hasValidParams =
		params.isEmailChangeComplete ||
		params.isEmailVerificationComplete ||
		params.emailChangeFailed ||
		params.emailVerificationFailed;

	if ( ! hasValidParams || ! [ '/me/account', '/settings/account' ].includes( context.pathname ) ) {
		return false;
	}

	// Check user preferences to see if they opted in to the Hosting Dashboard
	let state = context.store.getState();

	const arePreferencesLoaded = ( storeState ) =>
		! storeState.preferences.fetching && storeState.preferences.remoteValues !== null;

	if ( ! arePreferencesLoaded( state ) ) {
		// Wait for preferences to load
		const unsubscribe = context.store.subscribe( () => {
			state = context.store.getState();

			if ( arePreferencesLoaded( state ) ) {
				unsubscribe();

				if ( hasHostingDashboardOptIn( state ) ) {
					window.location.href = buildV2RedirectUrl( params.verified, params.newEmailResult );
				}
			}
		} );

		setTimeout( () => unsubscribe(), 10000 ); // 10 seconds

		next();
		return;
	}

	if ( hasHostingDashboardOptIn( state ) ) {
		window.location.href = buildV2RedirectUrl( params.verified, params.newEmailResult );
		return true;
	}

	return false;
}

/**
 * v1
 * Show notification for success cases only
 */
function handleV1Logic( context, next, params ) {
	if ( params.isEmailVerificationComplete ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'verified' ) );
		sendVerificationSignal();
		setTimeout( () => {
			const message = i18n.translate( 'Email confirmed!' );
			const notice = successNotice( message, { duration: 10000 } );
			context.store.dispatch( notice );
		}, 500 ); // A delay is needed here, because the notice state seems to be cleared upon page load
	} else if ( params.isEmailChangeComplete ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'new_email_result' ) );
		setTimeout( () => {
			const message = i18n.translate(
				'Email address updated. Make sure you update your contact information for any registered domains.'
			);
			const notice = successNotice( message, {
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
			} );
			context.store.dispatch( notice );
		}, 500 ); // A delay is needed here, because the notice state seems to be cleared upon page load
	}

	next();
}
