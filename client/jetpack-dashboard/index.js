/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeJetpackDashboardLayout, render as clientRender } from 'controller';
import { jetpackDashboard, preloadJetpackDashboard, setupSidebar } from './controller';

export default function() {
	page(
		'/',
		preloadJetpackDashboard,
		setupSidebar,
		jetpackDashboard,
		makeJetpackDashboardLayout,
		clientRender
	);
}
