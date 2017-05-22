/**
 * Internal dependencies
 */
import { makeLayout } from 'controller';
import { siteSelection, makeNavigation } from 'my-sites/controller';
import { preview } from './controller';

export default function( router ) {
	router( '/preview/:site', siteSelection, makeNavigation, preview, makeLayout );
}
