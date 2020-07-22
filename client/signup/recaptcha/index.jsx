/**
 * External dependencies
 */
import React, { memo, useEffect } from 'react';
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { initGoogleRecaptcha } from 'lib/analytics/recaptcha';
import config from 'config';

function Recaptcha() {
	useEffect( () => {
		initGoogleRecaptcha(
			'g-recaptcha',
			'calypso/checkout/pageLoad',
			config( 'google_recaptcha_site_key' )
		).then( ( result ) => {
			if ( ! result ) {
				return;
			}

			const { dispatch } = defaultRegistry;
			dispatch( 'wpcom' ).setRecaptchaClientId( parseInt( result.clientId ) );
		} );
	}, [] );

	return <div id="g-recaptcha"></div>;
}

export default memo( Recaptcha );
