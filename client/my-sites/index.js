/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/sites/:site', context => page.redirect( '/stats/insights/' + context.params.site ) );
	page( '/sites', siteSelection, sites, makeLayout, clientRender );
}
