/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';

export default function() {
	if ( config.isEnabled( 'oauth' ) ) {
		page( '/login', controller.login );
		page( '/authorize', controller.authorize );
		page( '/api/oauth/token', controller.getToken );
	}
};
