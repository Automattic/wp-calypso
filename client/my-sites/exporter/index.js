/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { exportSite } from 'my-sites/exporter/controller';

export default function() {
	page( '/export', siteSelection, navigation, sites, makeLayout, clientRender );
	page( '/export/:site_id', siteSelection, navigation, exportSite, makeLayout, clientRender );
}
