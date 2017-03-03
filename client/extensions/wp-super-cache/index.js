/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import controller from './controller';

export default function() {
	page( '/extensions/wp-super-cache/:tab?/:site?', siteSelection, navigation, controller.settings );
}
