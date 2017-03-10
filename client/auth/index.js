/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';

module.exports = function() {
	if ( config.isEnabled( 'oauth' ) ) {
		page( '/login', controller.login );
		page( '/authorize', controller.authorize );
		page( '/api/oauth/token', controller.getToken );
	}

	if ( config.isEnabled( 'magic-login' ) ) {
		page( '/login/link-has-expired', controller.magicLoginHasExpired );
		page( '/login/link-was-sent', controller.magicLoginLinkWasSent );
		page( '/login/handle-emailed-link', controller.magicLoginClickHandler );
		page( '/login/send-me-a-link', controller.magicLoginRequestEmailForm );
	}
};
