/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addLocaleToWpcomUrl, getLocaleSlug } from 'lib/i18n-utils';

const LostPassword = ( { translate } ) => {
	const url = addLocaleToWpcomUrl(
		'https://wordpress.com/wp-login.php?action=lostpassword',
		getLocaleSlug()
	);
	return (
		<p className="auth__lost-password">
			<a href={ url } target="_blank" rel="noopener noreferrer">
				{ translate( 'Lost your password?' ) }
			</a>
		</p>
	);
};

export default localize( LostPassword );
