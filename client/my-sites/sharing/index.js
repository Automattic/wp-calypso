/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { awaitSiteLoaded, jetpackModuleActive, navigation, sites, siteSelection } from 'my-sites/controller';
import { buttons, connections, layout } from './controller';

export default function() {
	page( /^\/sharing(\/buttons)?$/, siteSelection, sites );
	page( '/sharing/:domain', siteSelection, navigation, awaitSiteLoaded, jetpackModuleActive( 'publicize', false ), connections, layout );
	page( '/sharing/buttons/:domain', siteSelection, navigation, awaitSiteLoaded, jetpackModuleActive( 'sharedaddy' ), buttons, layout );
}
