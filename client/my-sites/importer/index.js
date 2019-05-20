/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { importSite } from 'my-sites/importer/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, sites, siteSelection } from 'my-sites/controller';

export default function() {
	page( '/import', siteSelection, navigation, sites, makeLayout, clientRender );
	page( '/import/:site_id', siteSelection, navigation, importSite, makeLayout, clientRender );
}
