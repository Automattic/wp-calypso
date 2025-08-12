/**
 * @group calypso-pr
 * @group dashboard
 */

import { DashboardPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Tests authentication requirements for the dashboard under /v2.
 *
 * This test verifies that unauthenticated users are redirected to the login page.
 */
describe( 'Dashboard: Authentication Test', function () {
	let page: Page;
	let dashboardPage: DashboardPage;

	beforeAll( async function () {
		// Create a fresh page without authentication
		page = await browser.newPage();
		dashboardPage = new DashboardPage( page );
	} );

	it( 'Redirects to login page when visiting dashboard without authentication', async function () {
		// Try to visit the dashboard without authentication
		await dashboardPage.visit();

		// Wait for navigation to complete
		await page.waitForLoadState( 'networkidle' );

		// Verify that we've been redirected to the login page
		const currentUrl = new URL( page.url() );
		expect( currentUrl.pathname ).toEqual( '/log-in' );
	} );
} );
