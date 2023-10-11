/**
 * @group jetpack-wpcom-integration
 */

import {
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
	TestAccount,
	EditorPage,
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
describe.only( DataHelper.createSuiteTitle( 'Fake editor load' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();

		// Simple sites do not have the ability to change SEO parameters.
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page, { waitUntilStable: true } );
	} );

	it( 'Navigate to the editor', async function () {
		const editor = new EditorPage( page );
		await editor.visit( 'post', { siteSlug: testAccount.getSiteURL( { protocol: false } ) } );
		await editor.waitUntilLoaded();
	} );
} );
