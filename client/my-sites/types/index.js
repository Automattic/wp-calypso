/**
 * Internal dependencies
 */

import { makeLayout } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import { list, redirect } from './controller';
import config from '@automattic/calypso-config';

export default function ( router ) {
	if ( ! config.isEnabled( 'manage/custom-post-types' ) ) {
		return;
	}

	router( '/types/:type/:status?/:site', siteSelection, navigation, list, makeLayout );
	router( '/types/:type', siteSelection, sites, makeLayout );
	router( '/types', redirect );
}
