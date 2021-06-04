/**
 * External dependencies
 */
import { DataHelper, LoginFlow, SidebarComponent, MarketingPage } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'SEO Preview Page' ), function () {
	let marketingPage;

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( this.page, 'wooCommerceUser' );
		await loginFlow.login();
	} );

	it( 'Navigate to Tools > Marketing page', async function () {
		const sidebarComponent = await SidebarComponent.Expect( this.page );
		await sidebarComponent.clickMenuItem( 'Tools' );
	} );

	it( 'Click on Traffic tab', async function () {
		marketingPage = await MarketingPage.Expect( this.page );
		await marketingPage.clickTabItem( 'Traffic' );
	} );

	it( 'Enter SEO meta description', async function () {
		await marketingPage.enterWebsiteMetaInformation();
	} );

	it( 'Open and close SEO preview', async function () {
		await marketingPage.openSEOPreview();
		await marketingPage.closeSEOPreview();
	} );
} );
