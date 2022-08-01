/**
 * @group quarantined
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

describe( DataHelper.createSuiteTitle( 'Support: Popover' ), function () {
	let page: Page;

	describe.each( [
		{ siteType: 'Simple', accountName: 'defaultUser' as TestAccountName },
		{ siteType: 'Atomic', accountName: 'atomicUser10percent' as TestAccountName },
	] )( 'Search and view a support article ($siteType)', function ( { accountName } ) {
		let supportComponent: SupportComponent;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
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
			const keyword = 'choose a theme';
			await supportComponent.search( keyword );
		} );

		it( 'Search results are shown', async function () {
			const results = await supportComponent.getResults( 'article' );
			expect( await results.count() ).toBeGreaterThan( 0 );
		} );

		it( 'Click on first search result', async function () {
			await supportComponent.clickResult( 'article', 1 );
		} );

		it( 'Scroll article', async function () {
			await supportComponent.scrollOpenArticle();
		} );

		it( 'Back to top button is shown', async function () {
			await supportComponent.backToTopVisible( true );
		} );

		it( 'Click back to top', async function () {
			await supportComponent.clickBackToTop();
		} );

		it( 'Back to top button is hidden', async function () {
			await supportComponent.backToTopVisible( false );
		} );

		it( 'Click on back button brings back the results', async function () {
			await supportComponent.clickBack();

			const results = await supportComponent.getResults( 'article' );
			expect( await results.count() ).toBeGreaterThan( 0 );
		} );

		it( 'Close popover', async function () {
			await supportComponent.closePopover();
		} );
	} );
} );
