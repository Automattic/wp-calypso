/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { customize } from './controller';
import config from 'config';
import { siteSelection, sites, navigation } from 'my-sites/controller';

export default function() {
	if ( config.isEnabled( 'manage/customize' ) ) {
		page( '/customize/:panel([^\.]+)?', siteSelection, sites );
		page( '/customize/:panel?/:domain', siteSelection, navigation, customize );
	}
}
