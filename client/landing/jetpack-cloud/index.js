/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */

import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

import { dashboard } from './sections/dashboard/controller';
import {
	backups,
	backupDetail,
	backupDownload,
	backupRestore,
} from './sections/backups/controller';
import { scan, scanHistory } from './sections/scan/controller';
import { settings } from './sections/settings/controller';

export default function() {
	page( '/', siteSelection, navigation, dashboard, makeLayout, clientRender );
	page( '/backups', siteSelection, sites, navigation, makeLayout, clientRender );

	page( '/backups/:site', siteSelection, navigation, backups, makeLayout, clientRender );
	page(
		'/backups/:site/detail/',
		siteSelection,
		navigation,
		backupDetail,
		makeLayout,
		clientRender
	);
	page(
		'/backups/:site/detail/:backupId',
		siteSelection,
		navigation,
		backupDetail,
		makeLayout,
		clientRender
	);
	page(
		'/backups/:site/download',
		siteSelection,
		navigation,
		backupDownload,
		makeLayout,
		clientRender
	);
	page(
		'/backups/:site/backups/download/:downloadId',
		navigation,
		backupDownload,
		makeLayout,
		clientRender
	);

	page( '/backups/restore', siteSelection, sites, navigation, makeLayout, clientRender );
	page(
		'/backups/:site/restore/',
		siteSelection,
		navigation,
		backupRestore,
		makeLayout,
		clientRender
	);
	page(
		'/backups/restore/:site/:restoreId',
		siteSelection,
		navigation,
		backupRestore,
		makeLayout,
		clientRender
	);

	page( '/scan', siteSelection, sites, navigation, makeLayout, clientRender );
	page( '/scan/:site', siteSelection, navigation, scan, makeLayout, clientRender );
	page( '/scan/:site/history', siteSelection, navigation, scanHistory, makeLayout, clientRender );

	page( '/settings', siteSelection, sites, navigation, makeLayout, clientRender );
	page( '/settings/:site', siteSelection, navigation, settings, makeLayout, clientRender );
}
