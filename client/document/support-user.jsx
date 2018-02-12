/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */

function supportUserFn( { user, token, authorized } ) {
	const url = window.location.toString();

	if ( url.indexOf( '?' ) > 0 ) {
		const cleanUrl = url.substring( 0, url.indexOf( '?' ) );
		window.history.replaceState( {}, document.title, cleanUrl );
	}

	if ( authorized ) {
		window.sessionStorage.setItem( 'boot_support_user', JSON.stringify( { user, token } ) );
	}

	window.location.replace( '/' );
}

function SupportUser( { supportUser, supportToken, authorized = false, urls, jsFile, config } ) {
	return (
		<html lang="en">
			<body>
				{ /* eslint-disable react/no-danger */ }
				{ config && <script type="text/javascript">{ config }</script> }
				<script src={ urls.manifest } />
				<script src={ urls.vendor } />
				<script src={ urls[ jsFile ] } />
				<script
					dangerouslySetInnerHTML={ {
						__html: `
						${ supportUserFn.toString() }

						supportUserFn( {
							user: ${ supportUser },
							token: ${ supportToken },
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
