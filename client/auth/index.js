/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
console.log(true);
module.exports = function() {
	page( '/login', controller.login );
	page( '/authorize', controller.authorize );
	page( '/api/oauth/token', controller.getToken );
};
