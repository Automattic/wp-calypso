import config from '@automattic/calypso-config';
import { useLayoutEffect } from 'react';
import { BLACKBOX_CHALLENGE_ROOT_ID } from 'calypso/blocks/login/utils/blackbox-challenge-root-id';
import { ensureBlackboxLoginScript } from 'calypso/blocks/login/utils/ensure-blackbox-login-script';

import './blackbox-login-challenge-mount.scss';

/**
 * Renders the Blackbox challenge mount inside the login card and loads v.js only after this tree exists,
 * so init runs next to the form instead of at document boot.
 */
export default function BlackboxLoginChallengeMount() {
	// useLayoutEffect: start loading as soon as `#blackbox-challenge-root` is in the DOM,
	// before paint, so globals and programmatic callbacks register before the user can submit.
	useLayoutEffect( () => {
		void ensureBlackboxLoginScript();
	}, [] );

	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return null;
	}

	return <div id={ BLACKBOX_CHALLENGE_ROOT_ID } className="login__form-blackbox-challenge" />;
}
