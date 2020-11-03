/**
 * External dependencies
 */
import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { initGoogleRecaptcha } from 'calypso/lib/analytics/recaptcha';
import config from 'calypso/config';

/**
 * Style dependencies
 */
import './style.scss';

function Recaptcha( { badgePosition } ) {
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

	return <div id="g-recaptcha" data-badge={ badgePosition }></div>;
}

Recaptcha.propTypes = {
	badgePosition: PropTypes.string,
};

Recaptcha.defaultProps = {
	badgePosition: 'bottomright',
};

export default memo( Recaptcha );
