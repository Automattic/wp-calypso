/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeJetpackDashboardLayout, render as clientRender } from 'controller';
import { jetpackDashboard, preloadJetpackDashboard } from './controller';

export default function() {
	page( '/', preloadJetpackDashboard, jetpackDashboard, makeJetpackDashboardLayout, clientRender );
}
