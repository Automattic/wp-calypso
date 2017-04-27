/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */

import { successNotice } from 'state/notices/actions';

/**
 * Page middleware for showing a confirmation notice after changing interface language.
 * Checks if the query string contains 'updated=language' and if it does, removes the
 * query string from the URL and shows a notice on the next page.
 */

export default function languageChangeConfirmation( context, next ) {
	const showNotice = ( 'language' === context.query.updated );

	if ( showNotice ) {
		context.store.dispatch( successNotice(
			i18n.translate( 'Your language was changed successfully.' ),
			{ displayOnNextPage: true }
		) );

		page.replace( window.location.pathname );
	}

	next();
}
