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
 * Tests the routing functionality of the dashboard under /v2.
 *
 * This test verifies that valid routes load correctly and
 * invalid routes show a 404 page.
 */
describe( 'Dashboard: Routing Test', function () {
	let page: Page;
	let dashboardPage: DashboardPage;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );

	beforeAll( async function () {
		page = await browser.newPage();
		await testAccount.authenticate( page );
		dashboardPage = new DashboardPage( page );
	} );

	it( 'Main dashboard page loads successfully', async function () {
		await dashboardPage.visit();
		const isLoaded = await dashboardPage.isLoaded();
		expect( isLoaded ).toBe( true );
	} );

	it( 'Nonexistent path shows a 404 page', async function () {
		await dashboardPage.visitPath( 'unicorn' );
		await dashboardPage.is404Page();
	} );
} );
