/**
 * @group calypso-pr
 */

import { DataHelper, SupportComponent, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Support: Show me where' ), function () {
	let page: Page;

	describe.each( [
		{ siteType: 'Simple', accountName: 'defaultUser' },
		{ siteType: 'Atomic', accountName: 'eCommerceUser' },
	] )( 'Search and view a support article ($siteType)', function ( { accountName } ) {
		let supportComponent: SupportComponent;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		afterAll( async () => {
			await page.close();
		} );

		it( 'Search for help: Create a site', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.showSupportCard();
			await supportComponent.search( 'create a site' );
			const results = await supportComponent.getResults( 'article' );
			expect( results.length ).toBeGreaterThan( 0 );
		} );

		it( 'Click on result under Show me where', async function () {
			await Promise.all( [ page.waitForNavigation(), supportComponent.clickResult( 'where', 1 ) ] );
		} );

		it( 'Signup flow is started', async function () {
			await page.waitForURL( '**/start/**' );
		} );
	} );
} );
