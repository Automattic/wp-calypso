import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import { sendVerificationSignal } from 'calypso/lib/user/verification-checker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';

/**
 * Page middleware
 */

export default function emailVerification( context, next ) {
	const showVerifiedNotice = '1' === context.query.verified;
	const showNewEmailNotice = '1' === context.query.new_email_result;

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
