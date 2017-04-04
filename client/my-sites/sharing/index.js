/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { buttons, connections, layout } from './controller';

export default function() {
	page( /^\/sharing(\/buttons)?$/, siteSelection, sites );
	page( '/sharing/:domain', siteSelection, navigation, connections, layout );
	page( '/sharing/buttons/:domain', siteSelection, navigation, buttons, layout );
}
