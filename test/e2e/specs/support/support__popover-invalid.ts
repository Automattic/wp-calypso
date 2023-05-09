/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SidebarComponent,
	SupportComponent,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Support: Popover/Invalid Keywords' ), function () {
	let page: Page;

	describe.each( [
		{ siteType: 'Simple', accountName: 'defaultUser' as TestAccountName },
		{ siteType: 'Atomic', accountName: 'atomicUser' as TestAccountName },
	] )( 'Unsupported search keywords ($siteType)', function ( { accountName } ) {
		let supportComponent: SupportComponent;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Open Settings page', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Settings', 'General' );
		} );

		it( 'Open support popover', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.openPopover();
		} );

		it( 'Displays default entries', async function () {
			await supportComponent.defaultStateShown();
		} );

		it( 'Enter empty search keyword and expect no results to be shown', async function () {
			const keyword = '        ';
			await supportComponent.search( keyword );
			await supportComponent.noResultsShown();
		} );

		it( 'Clear keyword', async function () {
			await supportComponent.clearSearch();
			await supportComponent.defaultStateShown();
		} );

		// Invalid keyword search often takes more than 30s to resolve.
		// See: https://github.com/Automattic/wp-calypso/issues/55478
		it.skip( 'Enter invalid search keyword and expect no results to be shown', async function () {
			const keyword = ';;;ppp;;;';
			await supportComponent.search( keyword );
			await supportComponent.noResultsShown();
		} );

		it( 'Close support popover', async function () {
			await supportComponent.closePopover();
		} );
	} );
} );
