/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { navigation, siteSelection } from 'my-sites/controller';

export default function() {
	page( '/demo/:site_id?', siteSelection, navigation, controller );
}
