/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { jetpackBackups } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/backups', siteSelection, sites, makeLayout, clientRender );

	page( '/backups/:site', siteSelection, navigation, jetpackBackups, makeLayout, clientRender );
}
