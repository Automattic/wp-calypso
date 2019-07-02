/** @format */

/**
 * Internal dependencies
 */

import { makeLayout } from 'controller';
import { siteSelection, sites, navigation } from 'my-sites/controller';
import { customerHome } from './controller';

export default function( router ) {
	router( '/home', siteSelection, sites, makeLayout );
	router( '/home/:site', siteSelection, navigation, customerHome, makeLayout );
}
