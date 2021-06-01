/**
 * External dependencies
 */
import config from 'config';
import {
	DataHelper,
	BrowserHelper,
	LoginFlow,
	SidebarComponent,
	MarketingPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] SEO Preview Page: (${ viewportName }) @canary @parallel @safaricanary`, function () {
	this.timeout( mochaTimeOut );
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
		await this.page.waitForTimeout( 2000 );
		await marketingPage.closeSEOPreview();
	} );
} );
