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
	jetpackDashboard,
	preloadJetpackDashboard,
	scan,
	security,
	setupSidebar,
} from './controller';

export default function() {
	page(
		'/security/backups',
		preloadJetpackDashboard,
		setupSidebar,
		backups,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/security/scan',
		preloadJetpackDashboard,
		setupSidebar,
		scan,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/security/anti-spam',
		preloadJetpackDashboard,
		setupSidebar,
		antiSpam,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/security/:siteId?',
		preloadJetpackDashboard,
		setupSidebar,
		security,
		makeJetpackDashboardLayout,
		clientRender
	);
	page(
		'/',
		preloadJetpackDashboard,
		setupSidebar,
		jetpackDashboard,
		makeJetpackDashboardLayout,
		clientRender
	);
}
