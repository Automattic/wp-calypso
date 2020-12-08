/**
 * External dependencies
 */

import React from 'react';
import { flatten, get, values } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import ValidationErrorList from 'calypso/notices/validation-error-list';

function getErrorFromApi( errorMessage ) {
	if ( errorMessage ) {
		const errorArray = errorMessage.split( /<a href="(.+)">(.+)<\/a>/ );

		if ( errorArray.length === 4 ) {
			// This assumes we have only one link
			const errorText1 = errorArray[ 0 ];
			const errorUrl = errorArray[ 1 ];
			const errorLinkText = errorArray[ 2 ];
			const errorText2 = errorArray[ 3 ];

			return (
				<span>
					{ errorText1 } <a href={ errorUrl }>{ errorLinkText }</a> { errorText2 }
				</span>
			);
		}

		return errorMessage;
	}

	return i18n.translate( 'There was a problem completing the checkout. Please try again.' );
}

export function displayError( error ) {
	const message = get( error, 'message' );
	if ( typeof message === 'object' ) {
		notices.error( <ValidationErrorList messages={ flatten( values( message ) ) } /> );
	} else {
		notices.error( getErrorFromApi( message ) );
	}
}

export function clear() {
	notices.clearNotices( 'notices' );
}
