/**
 * @group quarantined
 */

import {
	DataHelper,
	SidebarComponent,
	SupportComponent,
	setupHooks,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Support: Popover' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	describe.each( [
		{ siteType: 'Simple', accountName: 'defaultUser' },
		{ siteType: 'Atomic', accountName: 'eCommerceUser' },
	] )( 'Search and view a support article ($siteType)', function ( { accountName } ) {
		let supportComponent: SupportComponent;

		beforeAll( async () => {
			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		afterAll( async () => {
			await testAccount.clearAuthenticationState( page );
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
