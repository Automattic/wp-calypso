import {
	DataHelper,
	SidebarComponent,
	TestAccount,
	WoocommerceLandingPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'WooCommerce Landing Page' ), function () {
	let page: Page;

	describe.each( [ { siteType: 'Simple', accountName: 'defaultUser' } ] )(
		'Search and view a support article ($siteType)',
		function ( { accountName } ) {
			let landingPage: WoocommerceLandingPage;

			beforeAll( async () => {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			afterAll( async () => {
				await page.close();
			} );

			it( 'Navigate to WooCommerce (landing page)', async function () {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Tools', 'Marketing' );
			} );

			it( 'Open Learn more', async function () {
				landingPage = new WoocommerceLandingPage( page );
				await landingPage.openLearnMore();
			} );

			it( 'Open WooCommerce installer (/start)', async function () {
				landingPage = new WoocommerceLandingPage( page );
				await landingPage.openStoreSetup();
			} );
		}
	);

	// describe.each( [ { siteType: 'Atomic', accountName: 'eCommerceUser' } ] )(
	// 	'',
	// 	function ( { accountName } ) {
	// 		accountName;
	// 	}
	// );
} );
