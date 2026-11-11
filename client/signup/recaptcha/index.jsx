import config from '@automattic/calypso-config';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';
import { initGoogleRecaptcha } from 'calypso/lib/analytics/recaptcha';
import './style.scss';
import { recaptchaClientIdStore } from 'calypso/my-sites/checkout/src/lib/checkout-stores';

function Recaptcha( { badgePosition = 'bottomright' } ) {
	useEffect( () => {
		initGoogleRecaptcha( 'g-recaptcha', config( 'google_recaptcha_site_key' ) ).then(
			( clientId ) => {
				if ( clientId === null ) {
					return;
				}

				recaptchaClientIdStore.set( parseInt( clientId ) );
			}
		);
	}, [] );

	return <div id="g-recaptcha" data-badge={ badgePosition }></div>;
}

Recaptcha.propTypes = {
	badgePosition: PropTypes.string,
};

export default memo( Recaptcha );
