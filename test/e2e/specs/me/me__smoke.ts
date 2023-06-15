/**
 * @group calypso-pr
 * @group calypso-release
 */

import {
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Verifies the /me endpoint is functional.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/76266
 */
describe( 'Me: Smoke Test', function () {
	let page: Page;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );

	beforeAll( async function () {
		page = await browser.newPage();

		await testAccount.authenticate( page );
	} );

	it( 'Navigate to /me', async function () {
		await page.goto( DataHelper.getCalypsoURL( 'me' ) );
	} );

	it.each( [
		{ target: 'Account Settings', endpoint: 'account' },
		{ target: 'Purchases', endpoint: 'purchases' },
		{ target: 'Security', endpoint: 'security' },
		{ target: 'Privacy', endpoint: 'privacy' },
		{ target: 'Notification Settings', endpoint: 'notifications' },
		{ target: 'Blocked Sites', endpoint: 'site-blocks' },
		{ target: 'Apps', endpoint: 'get-apps' },
	] )( 'Navigate to Me > %s', async function ( { target, endpoint } ) {
		await page.getByRole( 'link', { name: target } ).click();
		await page.waitForURL( new RegExp( endpoint ) );
	} );
} );
