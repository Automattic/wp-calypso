/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import PrivacyComponent from 'me/privacy/main';

export default function privacyController( context, next ) {
	if ( ! config.isEnabled( 'me/privacy' ) ) {
		return page.redirect( '/me' );
	}
	context.primary = React.createElement( PrivacyComponent );
	next();
}
