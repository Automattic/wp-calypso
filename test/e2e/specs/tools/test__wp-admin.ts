/**
 * @group jetpack-wpcom-integration
 */

import {
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Quick test to verify various SEO text fields and previews render.
 *
 * This is a feature exclusive to Business plans and higher.
 *
 * Keywords: Jetpack, SEO, Traffic, Marketing.
 */
// eslint-disable-next-line jest/no-focused-tests
describe.only( DataHelper.createSuiteTitle( 'Marketing: SEO Preview' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();

		// Simple sites do not have the ability to change SEO parameters.
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to wp-admin', async function () {
		const url = new URL( 'wp-admin', testAccount.getSiteURL( { protocol: true } ) ).href;
		await page.goto( url, { timeout: 20 * 1000 } );
		await page.getByRole( 'heading', { name: 'Dashboard' } ).waitFor( { timeout: 20 * 1000 } );
	} );
} );
