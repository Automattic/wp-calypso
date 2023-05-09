/**
 * @group calypso-pr
 */

import { DataHelper, StatsPage, SidebarComponent, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Stats' ), function () {
	let page: Page;

	describe.each`
		siteType      | accountName
		${ 'Atomic' } | ${ 'atomicUser' }
	`( 'View Insights ($siteType)', function ( { accountName } ) {
		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Navigate to Stats', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Stats' );
		} );

		it( 'Click on Insights tab', async function () {
			const statsPage = new StatsPage( page );
			await statsPage.clickTab( 'Insights' );
		} );
	} );
} );
