import assert from 'assert';
import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	MyHomePage,
	SettingsPage,
	SupportComponent,
	setupHooks,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Support' ), function () {
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Search for a support topic then close popover', function () {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page );
			await loginFlow.logIn();
		} );

		it( 'Open Settings page', async function () {
			await MyHomePage.Expect( page );
			const sidebarComponent = await SidebarComponent.Expect( page );
			await sidebarComponent.gotoMenu( { item: 'Settings' } );
		} );

		it( 'Open support popover', async function () {
			await SettingsPage.Expect( page );
			supportComponent = await SupportComponent.Expect( page );
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

		it( 'Clear keyword', async function () {
			await supportComponent.clearSearch();
			const defaultResults = await supportComponent.getOverallResultsCount();
			assert.notStrictEqual( 0, defaultResults );
			const supportResults = await supportComponent.getSupportResultsCount();
			assert.strictEqual( 0, supportResults );
			const adminResults = await supportComponent.getAdminResultsCount();
			assert.strictEqual( 0, adminResults );
		} );

		it( 'Close support popover', async function () {
			await supportComponent.closePopover();
		} );
	} );

	describe( 'Search for a support topic and open a support page article', function () {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page );
			await loginFlow.logIn();
		} );

		it( 'Open Settings page', async function () {
			await MyHomePage.Expect( page );
			const sidebarComponent = await SidebarComponent.Expect( page );
			await sidebarComponent.gotoMenu( { item: 'Settings' } );
		} );

		it( 'Open support popover', async function () {
			await SettingsPage.Expect( page );
			supportComponent = await SupportComponent.Expect( page );
			await supportComponent.clickSupportButton();
		} );

		it( 'Displays default entries', async function () {
			const results = await supportComponent.getOverallResultsCount();
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

		it( 'Click on first link', async function () {
			await supportComponent.clickResult( 1 );
		} );
	} );

	describe( 'Empty search string', function () {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page );
			await loginFlow.logIn();
		} );

		it( 'Open Settings page', async function () {
			await MyHomePage.Expect( page );
			const sidebarComponent = await SidebarComponent.Expect( page );
			await sidebarComponent.gotoMenu( { item: 'Settings' } );
		} );

		it( 'Open support popover', async function () {
			await SettingsPage.Expect( page );
			supportComponent = await SupportComponent.Expect( page );
			await supportComponent.clickSupportButton();
		} );

		it( 'Displays default entries', async function () {
			const results = await supportComponent.getOverallResultsCount();
			assert.ok( results >= 5 );
		} );

		it( 'Enter invalid search keyword', async function () {
			const keyword = '        ';
			await supportComponent.search( keyword );
		} );

		it( 'Continues to display default results', async function () {
			const defaultResults = await supportComponent.getOverallResultsCount();
			assert.notStrictEqual( 0, defaultResults );
		} );
	} );

	describe( 'Invalid search string', function () {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page );
			await loginFlow.logIn();
		} );

		it( 'Open Settings page', async function () {
			await MyHomePage.Expect( page );
			const sidebarComponent = await SidebarComponent.Expect( page );
			await sidebarComponent.gotoMenu( { item: 'Settings' } );
		} );

		it( 'Open support popover', async function () {
			await SettingsPage.Expect( page );
			supportComponent = await SupportComponent.Expect( page );
			await supportComponent.clickSupportButton();
		} );

		it( 'Displays default entries', async function () {
			const results = await supportComponent.getOverallResultsCount();
			assert.ok( results >= 5 );
		} );

		it( 'Enter invalid search keyword', async function () {
			const keyword = ';;;ppp;;;';
			await supportComponent.search( keyword );
		} );

		it( 'No search results are shown', async function () {
			await supportComponent.noResults();
		} );
	} );
} );
