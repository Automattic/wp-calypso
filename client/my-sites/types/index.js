/**
 * Internal dependencies
 */

import { makeLayout } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import { list } from './controller';

export default function ( router ) {
	router( '/types/:type/:status?/:site', siteSelection, navigation, list, makeLayout );
	router( '/types/:type', siteSelection, sites, makeLayout );
	router( '/types', '/posts' );
}
