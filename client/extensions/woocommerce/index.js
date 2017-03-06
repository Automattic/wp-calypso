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
	page( '/store/:site?', siteSelection, navigation, controller.dashboard );
	page( '/store/:site?/products/add', siteSelection, navigation, controller.productsAdd );
}
