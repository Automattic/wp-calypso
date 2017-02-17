/**
 * External Dependencies
 */
import React from 'react';

function getPixelUrl( siteUrl ) {
	const pixel = encodeURI( siteUrl + 'wp-includes/images/blank.gif' );
	return `${ siteUrl }/wp-login.php?redirect_to=${ pixel }&reauth=1`;
}

export default ( siteUrl ) => <img className="plugin-automated-transfer__wpadmin-auto-login" src={ getPixelUrl( siteUrl ) } />;
