/**
 * External dependencies
 */
import React from 'react'; // eslint-disable-line no-unused-vars
import flatten from 'lodash/flatten';
import values from 'lodash/values';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices'
import ValidationErrorList from 'notices/validation-error-list';

function getErrorFromApi( errorMessage ) {
	if ( errorMessage ) {
		const errorArray = errorMessage.split( /<a href="(.+)">(.+)<\/a>/ );

		if ( errorArray.length === 4 ) { // This assumes we have only one link
			const errorText1 = errorArray[ 0 ],
				errorUrl = errorArray[ 1 ],
				errorLinkText = errorArray[ 2 ],
				errorText2 = errorArray[ 3 ];

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
	if ( typeof error.message === 'object' ) {
		notices.error( <ValidationErrorList messages={ flatten( values( error.message ) ) } /> );
	} else {
		notices.error( getErrorFromApi( error.message ) )
	}
}

export function displaySubmitting( { isFreeCart } ) {
	notices.info( isFreeCart ? i18n.translate( 'Submitting' ) : i18n.translate( 'Submitting payment' ) );
}

export function clear() {
	notices.clearNotices( 'notices' );
}
