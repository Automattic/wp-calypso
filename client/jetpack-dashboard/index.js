/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	antiSpam,
	backups,
	clientRender,
	handleRedirects,
	jetpackDashboard,
	makeLayout,
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
		makeLayout,
		clientRender
	);
	page(
		'/security/scan',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		scan,
		makeLayout,
		clientRender
	);
	page(
		'/security/anti-spam',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		antiSpam,
		makeLayout,
		clientRender
	);
	page(
		'/security/:siteId?',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		security,
		makeLayout,
		clientRender
	);
	page(
		'/',
		handleRedirects,
		preloadJetpackDashboard,
		setupSidebar,
		jetpackDashboard,
		makeLayout,
		clientRender
	);
}
