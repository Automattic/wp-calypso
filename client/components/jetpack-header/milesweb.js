/** @format */

/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

function JetpackMileswebLogo( { translate } ) {
	return (
		<img
			alt={ translate( 'Co-branded Jetpack and %(partnerName)s logo', {
				args: { partnerName: 'MilesWeb' },
			} ) }
			height="85px"
			src="/calypso/images/jetpack/jetpack-milesweb-connection.png"
			width="662.5px"
		/>
	);
}

export default localize( JetpackMileswebLogo );
