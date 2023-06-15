/**
 * @group calypso-pr
 * @group calypso-release
 */

import {
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	NavbarCartComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Me: Smoke Test', function () {
	let page: Page;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );

	beforeAll( async function () {
		page = await browser.newPage();

		await testAccount.authenticate( page );
	} );

	it( 'Navigate to /me', async function () {
		const navbarComponent = new NavbarCartComponent( page );
		await navbarComponent.clickMe();
	} );

	it( '' );
} );
