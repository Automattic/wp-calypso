/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeJetpackDashboardLayout, render as clientRender } from 'controller';
import {
	antiSpam,
	backups,
	handleRedirects,
	jetpackDashboard,
	preloadJetpackDashboard,
	scan,
	security,
	setupSidebar,
} from './controller';

export default function() {
	page(
		'/security/backups',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		backups,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/security/scan',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		scan,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/security/anti-spam',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		antiSpam,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/security/:siteId?',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		security,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		jetpackDashboard,
		makeJetpackDashboardLayout,
		clientRender
	);
}
