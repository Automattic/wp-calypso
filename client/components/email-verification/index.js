/**
 * External dependencies
 */

import * as React from 'react';

/**
 * Internal dependencies
 */

import { successNotice } from 'state/notices/actions';
import i18n from 'i18n-calypso';
import _user from 'lib/user';

/**
 * Constants
 */

const user = _user();

/**
 * Page middleware
 */

export default function emailVerification( context, next ) {
	let showVerifiedNotice = ( '1' === context.query.verified );

	if ( showVerifiedNotice ) {
		user.signalVerification();
		setTimeout( () => {
			let message = i18n.translate( '{{strong}}Email confirmed!{{/strong}} You may now publish content on your site.', { components: { strong: <strong/> } } );
			let notice = successNotice( message, { duration: 10000 } );
			context.store.dispatch( notice );
		}, 100 ); // A delay is needed here, because the notice state seems to be cleared upon page load
	}

	next();
}
