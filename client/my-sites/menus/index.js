/**
 * Internal dependencies
 */
import config from 'config';
import { siteSelection, navigation, sites } from 'my-sites/controller';
import { menus } from './controller';

export default function( router ) {
	if ( config.isEnabled( 'manage/menus' ) ) {
		router( '/menus/:site_id', siteSelection, navigation, menus );
		router( '/menus', siteSelection, sites );
	}
};
