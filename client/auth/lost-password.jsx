/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';

const LostPassword = ( { translate } ) => {
	const url = localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' );
	return (
		<p className="auth__lost-password">
			<a href={ url } target="_blank" rel="noopener noreferrer">
				{ translate( 'Lost your password?' ) }
			</a>
		</p>
	);
};

export default localize( LostPassword );
