/**
 * @group calypso-pr
 */

import { SupportComponent, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( 'Support: Show me where', function () {
	let page: Page;
	let supportComponent: SupportComponent;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Search for help: Create a site', async function () {
		supportComponent = new SupportComponent( page );
		await supportComponent.showSupportCard();
		await supportComponent.search( 'create a site' );
		const results = await supportComponent.getResults( 'article' );
		expect( await results.count() ).toBeGreaterThan( 0 );
	} );

	it( 'Click on result under Show me where', async function () {
		await supportComponent.clickResult( 'where', 1 );
	} );

	it( 'Signup flow is started', async function () {
		await page.waitForURL( /start/ );
	} );
} );
