import assert from 'assert';
import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	SupportComponent,
	setupHooks,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Support' ), function () {
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe.each( [
		{ siteType: 'Simple', user: 'defaultUser' },
		{ siteType: 'Atomic', user: 'wooCommerceUser' },
	] )( 'Search and view a support article ($siteType)', function ( { user } ) {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Open Settings page', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.gotoMenu( { item: 'Settings', subitem: 'General' } );
		} );

		it( 'Open support popover', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.clickSupportButton();
		} );

		it( 'Displays default entries', async function () {
			const results = await supportComponent.getOverallResultsCount();
			// Default entries varies from 5 on TeamCity to 6 when run locally.
			// This statement would check that at least 5 items are visible to compensate.
			assert.ok( results >= 5 );
		} );

		it( 'Enter search keyword', async function () {
			const keyword = 'domain';
			await supportComponent.search( keyword );
		} );

		it( 'Search results are shown', async function () {
			const supportCount = await supportComponent.getSupportResultsCount();
			assert.strictEqual( 4, supportCount );

			const adminCount = await supportComponent.getAdminResultsCount();
			assert.strictEqual( 3, adminCount );
		} );

		it( 'Click and view first support article', async function () {
			await supportComponent.clickResult( 1 );
		} );

		it( 'Visit and close support article page', async function () {
			const supportArticlePage = await supportComponent.visitArticle();
			await supportArticlePage.close();
		} );

		it( 'Close support article preview', async function () {
			await supportComponent.closeArticle();
		} );
	} );

	describe.each( [
		{ siteType: 'Simple', user: 'defaultUser' },
		{ siteType: 'Atomic', user: 'wooCommerceUser' },
	] )( 'Unsupported search keywords ($siteType)', function ( { user } ) {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Open Settings page', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.gotoMenu( { item: 'Settings', subitem: 'General' } );
		} );

		it( 'Open support popover', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.clickSupportButton();
		} );

		it( 'Displays default entries', async function () {
			const results = await supportComponent.getOverallResultsCount();
			assert.ok( results >= 5 );
		} );

		it( 'Enter empty search keyword', async function () {
			const keyword = '        ';
			await supportComponent.search( keyword );
		} );

		it( 'Continues to display default results', async function () {
			const defaultResults = await supportComponent.getOverallResultsCount();
			assert.notStrictEqual( 0, defaultResults );
		} );

		it( 'Clear keyword', async function () {
			await supportComponent.clearSearch();

			const defaultResults = await supportComponent.getOverallResultsCount();
			assert.notStrictEqual( 0, defaultResults );
			const supportResults = await supportComponent.getSupportResultsCount();
			assert.strictEqual( 0, supportResults );
			const adminResults = await supportComponent.getAdminResultsCount();
			assert.strictEqual( 0, adminResults );
		} );

		it( 'Enter invalid search keyword', async function () {
			const keyword = ';;;ppp;;;';
			await supportComponent.search( keyword );
		} );

		it( 'No search results are shown', async function () {
			await supportComponent.noResults();
		} );

		it( 'Close support popover', async function () {
			await supportComponent.clearSearch();
			await supportComponent.closePopover();
		} );
	} );
} );
