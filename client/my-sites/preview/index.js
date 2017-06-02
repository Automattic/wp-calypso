/**
 * Internal dependencies
 */
import { makeLayout } from 'controller';
import { siteSelection, sites, makeNavigation } from 'my-sites/controller';
import { preview } from './controller';

export default function( router ) {
	router( '/preview', siteSelection, sites );
	router( '/preview/:site', siteSelection, makeNavigation, preview, makeLayout );
}
