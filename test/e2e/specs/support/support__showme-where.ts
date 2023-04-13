/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SupportComponent,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Support: Show me where' ), function () {
	let page: Page;

	describe.each( [
		{ siteType: 'Simple', accountName: 'defaultUser' as TestAccountName },
		{ siteType: 'Atomic', accountName: 'atomicUser' as TestAccountName },
	] )( 'Search and view a support article ($siteType)', function ( { accountName } ) {
		let supportComponent: SupportComponent;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
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
			await Promise.all( [ page.waitForNavigation(), supportComponent.clickResult( 'where', 1 ) ] );
		} );

		it( 'Signup flow is started', async function () {
			await page.waitForURL( '**/start/**' );
		} );
	} );
} );
