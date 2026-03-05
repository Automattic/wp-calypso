import {
	DataHelper,
	PluginsPage,
	SidebarComponent,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Plugins search' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		test( 'As a user, I can search for plugins and navigate search results', async ( { page } ) => {
			let pluginsPage: PluginsPage;
			let siteUrl: string;

			await test.step( 'Authenticate', async () => {
				const testAccount = new TestAccount( 'defaultUser' );
				await testAccount.authenticate( page );

				siteUrl = testAccount
					.getSiteURL( { protocol: false } )
					.replace( 'https://', '' )
					.replace( '/wp-admin', '' );

				if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
					await page.setViewportSize( { width: 1300, height: 1080 } );
				}
			} );

			await test.step( 'Navigate to the plugins page', async () => {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Plugins' );
			} );

			await test.step( 'Search for "woocommerce"', async () => {
				pluginsPage = new PluginsPage( page );
				await pluginsPage.search( 'woocommerce' );
				await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
			} );

			await test.step( 'Click on a search result', async () => {
				await pluginsPage.clickSearchResult( 'WooCommerce' );
				await pluginsPage.validatePluginDetailsHasHeaderTitle( 'WooCommerce' );
			} );

			await test.step( 'Click on breadcrumbs "Search Results"', async () => {
				if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
					await pluginsPage.clickSearchResultsBreadcrumb();
				} else {
					await pluginsPage.clickBackBreadcrumb();
				}
				await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
			} );

			await test.step( 'Click on breadcrumbs "Plugins"', async () => {
				await pluginsPage.clickSearchResult( 'WooCommerce' );
				if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
					await pluginsPage.clickPluginsBreadcrumb();
					await pluginsPage.validateHasSection( PluginsPage.paidSection );
				} else {
					await pluginsPage.clickBackBreadcrumb();
					await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
				}
			} );

			await test.step( 'Navigate back to the default plugins page when searching from categories pages', async () => {
				await pluginsPage.validateCategoryButton(
					'Search Engine Optimization',
					envVariables.VIEWPORT_NAME !== 'mobile'
				);
				await pluginsPage.search( 'woocommerce' );
				await page.waitForURL( new RegExp( `/plugins/${ siteUrl }\\?s=woocommerce`, 'g' ) );
			} );
		} );
	}
);
