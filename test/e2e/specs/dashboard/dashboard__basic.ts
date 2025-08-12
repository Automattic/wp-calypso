/**
 * @group calypso-pr
 * @group dashboard
 */

import {
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DashboardPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Verifies the new dashboard under /v2 is functional.
 *
 * This is a basic test that just checks if the dashboard entry page loads correctly.
 */
describe( 'Dashboard: Basic Test', function () {
	let page: Page;
	let dashboardPage: DashboardPage;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );

	beforeAll( async function () {
		page = await browser.newPage();
		await testAccount.authenticate( page );
		dashboardPage = new DashboardPage( page );
	} );

	it( 'Navigate to the dashboard entry page', async function () {
		await dashboardPage.visit();

		// Verify the dashboard loaded correctly
		const isLoaded = await dashboardPage.isLoaded();
		expect( isLoaded ).toBe( true );

		// Optional: Get and check the heading if relevant
		const headingText = await dashboardPage.getHeadingText();
		expect( headingText ).toEqual( 'Sites' );
	} );
} );
