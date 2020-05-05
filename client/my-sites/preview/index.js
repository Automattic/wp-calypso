/**
 * Internal dependencies
 */

import { makeLayout } from 'controller';
import { siteSelection, sites, navigation } from 'my-sites/controller';
import { preview } from './controller';

export default function ( router ) {
	router( '/view', siteSelection, sites, makeLayout );
	router( '/view/:site', siteSelection, navigation, preview, makeLayout );
}
