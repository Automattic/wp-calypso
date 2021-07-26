/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */

import { successNotice } from 'calypso/state/notices/actions';
import { sendVerificationSignal } from 'calypso/lib/user/verification-checker';

/**
 * Page middleware
 */

export default function emailVerification( context, next ) {
	const showVerifiedNotice = '1' === context.query.verified;

	if ( showVerifiedNotice ) {
		sendVerificationSignal();
		setTimeout( () => {
			const message = i18n.translate( 'Email confirmed!' );
			const notice = successNotice( message, { duration: 10000 } );
			context.store.dispatch( notice );
		}, 500 ); // A delay is needed here, because the notice state seems to be cleared upon page load
	}

	next();
}
