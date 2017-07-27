/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { navigation } from 'my-sites/controller';

export default function() {
	page( '/demo', navigation, controller );
}
