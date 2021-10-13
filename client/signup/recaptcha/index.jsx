import config from '@automattic/calypso-config';
import { defaultRegistry } from '@automattic/composite-checkout';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';
import { initGoogleRecaptcha } from 'calypso/lib/analytics/recaptcha';
import './style.scss';

function Recaptcha( { badgePosition } ) {
	useEffect( () => {
		initGoogleRecaptcha( 'g-recaptcha', config( 'google_recaptcha_site_key' ) ).then(
			( clientId ) => {
				if ( clientId === null ) {
					return;
				}

				const { dispatch } = defaultRegistry;
				dispatch( 'wpcom' ).setRecaptchaClientId( parseInt( clientId ) );
			}
		);
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
