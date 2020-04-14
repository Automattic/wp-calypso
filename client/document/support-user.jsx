/**
 * External dependencies
 *
 */

import React from 'react';

/**
 * Internal dependencies
 */

function supportUserFn( { user, token, path, authorized } ) {
	const url = window.location.toString();

	if ( url.indexOf( '?' ) > 0 ) {
		const cleanUrl = url.substring( 0, url.indexOf( '?' ) );
		window.history.replaceState( {}, document.title, cleanUrl );
	}

	if ( authorized ) {
		window.sessionStorage.setItem( 'boot_support_user', window.JSON.stringify( { user, token } ) );
	}

	// Only redirect to same-domain
	const redirectUrl = new URL( url );
	redirectUrl.pathname = path ? decodeURIComponent( path ) : '/';
	redirectUrl.search = '';
	window.location.replace( redirectUrl.href );
}

function SupportUser( { supportUser, supportToken, supportPath, authorized = false } ) {
	return (
		<html lang="en">
			<body>
				{ /* eslint-disable react/no-danger */ }
				<script
					dangerouslySetInnerHTML={ {
						__html: `
						const supportUserFn = ${ supportUserFn.toString() };

						supportUserFn( {
							user: ${ supportUser && `"${ encodeURIComponent( supportUser ) }"`},
							token: ${ supportToken && `"${ encodeURIComponent( supportToken ) }"`},
							path: ${ supportPath && `"${ encodeURIComponent( supportPath ) }"`},
							authorized: ${ authorized }
						} );
						`,
					} }
				/>
				{ /* eslint-enable react/no-danger */ }
			</body>
		</html>
	);
}

export default SupportUser;
