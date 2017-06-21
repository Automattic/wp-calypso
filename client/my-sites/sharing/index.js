/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { jetpackModuleActive, buttons, connections, layout } from './controller';

export default function() {
	page( /^\/sharing(\/buttons)?$/, siteSelection, sites );
	page( '/sharing/:domain', siteSelection, navigation, jetpackModuleActive( 'publicize', false ), connections, layout );
	page( '/sharing/buttons/:domain', siteSelection, navigation, jetpackModuleActive( 'sharedaddy' ), buttons, layout );
}
