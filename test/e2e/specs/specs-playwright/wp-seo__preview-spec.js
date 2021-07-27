import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	MarketingPage,
	setupHooks,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'SEO Preview Page' ), function () {
	let marketingPage;
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'wooCommerceUser' );
		await loginFlow.logIn();
	} );

	it( 'Navigate to Tools > Marketing page', async function () {
		const sidebarComponent = await SidebarComponent.Expect( page );
		await sidebarComponent.gotoMenu( { item: 'Tools', subitem: 'Marketing' } );
	} );

	it( 'Click on Traffic tab', async function () {
		marketingPage = await MarketingPage.Expect( page );
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
