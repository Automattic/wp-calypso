/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites, navigation } from 'my-sites/controller';
import { customize } from './controller';
import config from 'config';

export default function() {
	if ( config.isEnabled( 'manage/customize' ) ) {
		page( '/customize/:panel([^\.]+)?', siteSelection, sites );
		page( '/customize/:panel?/:domain', siteSelection, navigation, customize );
	}
}
