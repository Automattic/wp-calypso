import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import { sendVerificationSignal } from 'calypso/lib/user/verification-checker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { hasHostingDashboardOptIn } from 'calypso/state/sites/selectors/has-hosting-dashboard-opt-in';

/**
 * Page middleware
 */

export default function emailVerification( context, next ) {
	const showVerifiedNotice = '1' === context.query.verified;
	const showNewEmailNotice = '1' === context.query.new_email_result;

	// Redirect email verification to v2 for users who have opted into the new Hosting Dashboard
	if (
		showNewEmailNotice &&
		( context.pathname === '/me/account' || context.pathname === '/settings/account' )
	) {
		let state = context.store.getState();

		const arePreferencesLoaded = ( storeState ) =>
			! storeState.preferences.fetching && storeState.preferences.remoteValues !== null;

		if ( ! arePreferencesLoaded( state ) ) {
			// Wait for preferences to load
			const unsubscribe = context.store.subscribe( () => {
				state = context.store.getState();

				// Check if preferences have loaded
				if ( arePreferencesLoaded( state ) ) {
					unsubscribe();

					if ( hasHostingDashboardOptIn( state ) ) {
						window.location.href = `/v2/me/profile?new_email_result=${ context.query.new_email_result }`;
					}
				}
			} );

			setTimeout( () => unsubscribe(), 10000 ); // 10 seconds

			next();
			return;
		}

		if ( hasHostingDashboardOptIn( state ) ) {
			window.location.href = `/v2/me/profile?new_email_result=${ context.query.new_email_result }`;
			return;
		}
	}

	if ( showVerifiedNotice ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'verified' ) );
		sendVerificationSignal();
		setTimeout( () => {
			const message = i18n.translate( 'Email confirmed!' );
			const notice = successNotice( message, { duration: 10000 } );
			context.store.dispatch( notice );
		}, 500 ); // A delay is needed here, because the notice state seems to be cleared upon page load
	} else if ( showNewEmailNotice ) {
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
