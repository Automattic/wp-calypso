import { PluginsPage, envVariables } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Tests plugin search functionality including navigation and breadcrumbs.
 *
 * Keywords: Plugins, Search
 */
test.describe( 'Plugins search', { tag: [ tags.CALYPSO_PR ] }, () => {
	let siteUrl: string;

	test( 'Search for plugins and navigate using breadcrumbs', async ( {
		accountDefaultUser,
		componentSidebar,
		page,
		pagePlugins,
	} ) => {
		await test.step( 'Given I am authenticated as defaultUser', async function () {
			await accountDefaultUser.authenticate( page );

			siteUrl = accountDefaultUser
				.getSiteURL( { protocol: false } )
				.replace( 'https://', '' )
				.replace( '/wp-admin', '' );

			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				// Ensure the page is wide enough to show the breadcrumb details.
				await page.setViewportSize( { width: 1300, height: 1080 } );
			}
		} );

		await test.step( 'When I navigate to the Plugins page', async function () {
			await componentSidebar.navigate( 'Plugins' );
		} );

		await test.step( 'Then I see the Plugins page', async function () {
			await expect( page ).toHaveURL( /plugins/ );
		} );

		await test.step( 'When I search for "woocommerce"', async function () {
			await pagePlugins.search( 'woocommerce' );
		} );

		await test.step( 'Then I see "WooCommerce" in the search results', async function () {
			// For this assumption we need to use a plugin whose name isn't changed often
			await pagePlugins.validateExpectedSearchResultFound( 'WooCommerce' );
		} );

		await test.step( 'When I click on the "WooCommerce" search result', async function () {
			await pagePlugins.clickSearchResult( 'WooCommerce' );
		} );

		await test.step( 'Then I see the WooCommerce plugin details page', async function () {
			await pagePlugins.validatePluginDetailsHasHeaderTitle( 'WooCommerce' );
		} );

		await test.step( 'When I click the "Search Results" breadcrumb', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pagePlugins.clickSearchResultsBreadcrumb();
			} else {
				await pagePlugins.clickBackBreadcrumb();
			}
		} );

		await test.step( 'Then I return to the search results page', async function () {
			await pagePlugins.validateExpectedSearchResultFound( 'WooCommerce' );
		} );

		await test.step( 'When I click on "WooCommerce" again and navigate using breadcrumbs', async function () {
			await pagePlugins.clickSearchResult( 'WooCommerce' );
		} );

		await test.step( 'And I click the "Plugins" breadcrumb', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pagePlugins.clickPluginsBreadcrumb();
			} else {
				await pagePlugins.clickBackBreadcrumb();
			}
		} );

		await test.step( 'Then I see the appropriate plugins page', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pagePlugins.validateHasSection( PluginsPage.paidSection );
			} else {
				await pagePlugins.validateExpectedSearchResultFound( 'WooCommerce' );
			}
		} );

		await test.step( 'When I navigate to a category and search from there', async function () {
			await pagePlugins.validateCategoryButton(
				'Search Engine Optimization',
				envVariables.VIEWPORT_NAME !== 'mobile'
			);
			await pagePlugins.search( 'woocommerce' );
		} );

		await test.step( 'Then I am redirected to the default plugins page with search results', async function () {
			await page.waitForURL( new RegExp( `/plugins/${ siteUrl }\\?s=woocommerce`, 'g' ) );
			await expect( page ).toHaveURL( new RegExp( `/plugins/${ siteUrl }\\?s=woocommerce` ) );
		} );
	} );
} );
