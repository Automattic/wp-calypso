/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginPage,
	SidebarComponent,
	SupportComponent,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Support: Popover/Invalid Keywords' ), function () {
	let page: Page;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	describe.each( [
		{ siteType: 'Simple', user: 'defaultUser' },
		{ siteType: 'Atomic', user: 'eCommerceUser' },
	] )( 'Unsupported search keywords ($siteType)', function ( { user } ) {
		let supportComponent: SupportComponent;

		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
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
