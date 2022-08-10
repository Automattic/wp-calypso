/**
 * @group help-centre
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

describe( DataHelper.createSuiteTitle( 'Support: Popover Editor' ), function () {
	let page: Page;

	describe.each( [
		{ siteType: 'Simple', accountName: 'defaultUser' as TestAccountName },
		{ siteType: 'Atomic', accountName: 'atomicUser10percent' as TestAccountName },
	] )( 'Search and view a support article ($siteType)', function ( { siteType, accountName } ) {
		let supportComponent: SupportComponent;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Navigate to Tools > Marketing', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Appearance', 'Editor' );
		} );

		it( 'Open support popover', async function () {
			const inIFrame = siteType === 'Simple';
			supportComponent = new SupportComponent( page, { inIFrame } );
			await supportComponent.openPopover();
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
