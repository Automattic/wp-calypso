/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

module.exports = function() {
	page( '/login', controller.login );
};
