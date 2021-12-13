/**
 * @group quarantined
 */

import {
	DataHelper,
	LoginPage,
	SidebarComponent,
	SupportComponent,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Support: Popover' ), function () {
	let page: Page;
	let loginPage: LoginPage;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	describe.each( [
		{ siteType: 'Simple', testAccount: 'defaultUser' },
		{ siteType: 'Atomic', testAccount: 'eCommerceUser' },
	] )( 'Search and view a support article ($siteType)', function ( { testAccount } ) {
		let supportComponent: SupportComponent;

		it( `Log in with ${ testAccount }`, async function () {
			if ( ! loginPage ) {
				loginPage = new LoginPage( page );
				await loginPage.visit();
			} else {
				await loginPage.visit();
				await loginPage.clickChangeAccount();
			}
			await loginPage.logInWithTestAccount( testAccount );
		} );

		it( 'Navigate to Tools > Marketing', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Tools', 'Marketing' );
		} );

		it( 'Open support popover', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.openPopover();
		} );

		it( 'Displays default entries', async function () {
			await supportComponent.defaultStateShown();
		} );

		it( 'Enter search keyword', async function () {
			const keyword = 'theme';
			await supportComponent.search( keyword );
		} );

		it( 'Search results are shown', async function () {
			const results = await supportComponent.getResults( 'article' );
			expect( results.length ).toBeGreaterThan( 0 );
		} );

		it( 'Click on first search result', async function () {
			await supportComponent.clickResult( 'article', 1 );
			await supportComponent.clickReadMore();
		} );

		it( 'Close popover', async function () {
			await supportComponent.closePopover;
		} );
	} );
} );
