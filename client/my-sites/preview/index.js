/**
 * Internal dependencies
 */
import { preview } from './controller';
import { makeLayout } from 'controller';
import { siteSelection, sites, makeNavigation } from 'my-sites/controller';

export default function( router ) {
	router( '/view', siteSelection, sites );
	router( '/view/:site', siteSelection, makeNavigation, preview, makeLayout );
}
