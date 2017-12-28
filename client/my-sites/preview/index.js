/** @format */

/**
 * Internal dependencies
 */

import { makeLayout } from 'client/controller';
import { siteSelection, sites, navigation } from 'client/my-sites/controller';
import { preview } from './controller';

export default function( router ) {
	router( '/view', siteSelection, sites );
	router( '/view/:site', siteSelection, navigation, preview, makeLayout );
}
