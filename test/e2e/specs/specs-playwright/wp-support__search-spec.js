/**
 * External dependencies
 */
import assert from 'assert';
import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	MyHomePage,
	SettingsPage,
	SupportComponent,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Support' ), function () {
	describe( 'Search for a support topic', function () {
		let supportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page );
			await loginFlow.login();
		} );

		it( 'Open Settings page', async function () {
			await MyHomePage.Expect( this.page );
			const sidebarComponent = await SidebarComponent.Expect( this.page );
			await sidebarComponent.clickMenuItem( 'Settings' );
		} );

		it( 'Open support popover', async function () {
			await SettingsPage.Expect( this.page );
			supportComponent = await SupportComponent.Expect( this.page );
			await supportComponent.clickSupportButton();
		} );

		it( 'Displays six entries by default', async function () {
			const defaultResults = await supportComponent.getOverallResultsCount();
			assert.strictEqual( 6, defaultResults );
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
	} );
} );
