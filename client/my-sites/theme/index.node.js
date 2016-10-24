/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { details, fetchThemeDetailsData } from './controller';

export default function( router ) {
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		router( '/theme/:slug/:section(setup|support)?/:site_id?', fetchThemeDetailsData, details, makeLayout );
	}
}
