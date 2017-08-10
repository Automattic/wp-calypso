/** @format */
/**
 * Internal dependencies
 */
import { makeLayout } from 'controller';
import { siteSelection, sites, makeNavigation } from 'my-sites/controller';
import { preview } from './controller';

export default function( router ) {
	router( '/view', siteSelection, sites );
	router( '/view/:site', siteSelection, makeNavigation, preview, makeLayout );
}
