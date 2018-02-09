/**
 * External dependencies
 *
 * @format
 */
import React from 'react';

/**
 * Internal dependencies
 */

function SupportUser( { supportUser = '', supportToken = '', authorized = false } ) {
	return (
		<html lang="en">
			{ /* eslint-disable react/no-danger */ }
			<head>
				<script
					dangerouslySetInnerHTML={ {
						__html: `
            const user = "${ supportUser }";
            const token = "${ supportToken }";
            const authorized = ${ authorized };

            const url = window.location.toString();

            if ( url.indexOf('?') > 0 ) {
              const cleanUrl = url.substring( 0, url.indexOf( '?' ) );
              window.history.replaceState( {}, document.title, cleanUrl );
            }

            if ( authorized ) {
              window.sessionStorage.setItem( 'boot_support_user', JSON.stringify( { user, token } ) );
            }

            window.location.replace( '/' );
            `,
					} }
				/>
			</head>
			<body />
			{ /* eslint-enable react/no-danger */ }
		</html>
	);
}

export default SupportUser;
