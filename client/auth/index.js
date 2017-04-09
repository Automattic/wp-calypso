/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';

export default () => {
	if ( config.isEnabled( 'oauth' ) ) {
		page( '/oauth-login', controller.oauthLogin );
		page( '/authorize', controller.authorize );
		page( '/api/oauth/token', controller.getToken );
	}
};
