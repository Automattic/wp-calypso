/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';

export default function LostPassword() {
	const translate = useTranslate();
	const url = localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' );

	return (
		<p className="auth__lost-password">
			<a href={ url } target="_blank" rel="noopener noreferrer">
				{ translate( 'Lost your password?' ) }
			</a>
		</p>
	);
}
