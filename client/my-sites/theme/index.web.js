/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { details, fetchThemeDetailsData } from './controller';
import { siteSelection } from 'my-sites/controller';

export default function( router, renderer ) {
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		router( '/theme/:slug/:section?/:site_id?', siteSelection, fetchThemeDetailsData, details, makeLayout, renderer );
	}
}
