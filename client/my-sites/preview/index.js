/**
 * Internal dependencies
 */

import { makeLayout } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { preview } from './controller';

export default function ( router ) {
	router( '/view', siteSelection, sites, makeLayout );
	router( '/view/:site', siteSelection, navigation, preview, makeLayout );
}
