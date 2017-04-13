/**
 * Internal dependencies
 */
import { makeLayout } from 'controller';
import { siteSelection, makeSites, makeNavigation } from 'my-sites/controller';
import { customize, redirectMenus } from './controller';
import config from 'config';

export default function( router ) {
	if ( config.isEnabled( 'manage/customize' ) ) {
		router( '/menus/:site?', redirectMenus );

		router( '/customize/:panel([^\.]+)?', siteSelection, makeSites );
		router( '/customize/:panel?/:domain', siteSelection, makeNavigation, customize, makeLayout );
	}
}
