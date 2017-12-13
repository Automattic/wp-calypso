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
	page( '/sites/:sitesFilter?', siteSelection, sites, makeLayout, clientRender );
}
