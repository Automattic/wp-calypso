/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */

import { successNotice } from 'state/notices/actions';
import userFactory from 'lib/user';

/**
 * Constants
 */

const user = userFactory();

/**
 * Page middleware
 */

export default function emailVerification( context, next ) {
	let showVerifiedNotice = ( '1' === context.query.verified );

	if ( showVerifiedNotice ) {
		user.signalVerification();
		setTimeout( () => {
			// TODO: unify these once translations catch up
			let message = i18n.getLocaleSlug() === 'en'
				? i18n.translate( 'Email confirmed!' )
				: i18n.translate( "Email confirmed! Now that you've confirmed your email address you can publish posts on your blog." );
			let notice = successNotice( message, { duration: 10000 } );
			context.store.dispatch( notice );
		}, 100 ); // A delay is needed here, because the notice state seems to be cleared upon page load
	}

	next();
}
