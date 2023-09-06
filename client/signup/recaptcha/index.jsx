import config from '@automattic/calypso-config';
import { useDispatch } from '@wordpress/data';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';
import { initGoogleRecaptcha } from 'calypso/lib/analytics/recaptcha';
import './style.scss';
import { CHECKOUT_STORE } from 'calypso/my-sites/checkout/src/lib/wpcom-store';

function Recaptcha( { badgePosition } ) {
	const { setRecaptchaClientId } = useDispatch( CHECKOUT_STORE ) ?? {};
	useEffect( () => {
		initGoogleRecaptcha( 'g-recaptcha', config( 'google_recaptcha_site_key' ) ).then(
			( clientId ) => {
				if ( clientId === null ) {
					return;
				}

				setRecaptchaClientId?.( parseInt( clientId ) );
			}
		);
	}, [ setRecaptchaClientId ] );

	return <div id="g-recaptcha" data-badge={ badgePosition }></div>;
}

Recaptcha.propTypes = {
	badgePosition: PropTypes.string,
};

Recaptcha.defaultProps = {
	badgePosition: 'bottomright',
};

export default memo( Recaptcha );
