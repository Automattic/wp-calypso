/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	page( '/onboarding/start', controller.start );
	page( '/onboarding/token', controller.saveToken );
	page( '/onboarding', controller.init );
}
