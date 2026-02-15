import {
	PluginsPage,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	TestAccount,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Tests plugin browsing functionality including sections, categories, and featured plugins.
 *
 * Keywords: Plugins, Browse
 */
test.describe( 'Plugins: Browse', { tag: [ tags.CALYPSO_PR, tags.JETPACK_REMOTE_SITE ] }, () => {
	let siteUrl: string;

	test( 'Browse plugins sections and categories', async ( { page, pagePlugins } ) => {
		const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );

		await test.step( `Given I am authenticated as '${ testUser }'`, async function () {
			const testAccount = new TestAccount( testUser );
			await testAccount.authenticate( page );

			siteUrl = testAccount
				.getSiteURL( { protocol: false } )
				.replace( 'https://', '' )
				.replace( '/wp-admin', '' );
		} );

		await test.step( 'When I visit the plugins page', async function () {
			await pagePlugins.visit( siteUrl );
		} );

		await test.step( 'Then I see the plugins page', async function () {
			await expect( page ).toHaveURL( new RegExp( `/plugins/${ siteUrl }` ) );
		} );

		const expectedSections = [ PluginsPage.featuredSection, PluginsPage.freeSection ];
		if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
			// On WPCOM sites, we should have premium plugins.
			// These are hidden on self hosted sites due to source code download restrictions.
			expectedSections.push( PluginsPage.paidSection );
		}

		for ( const section of expectedSections ) {
			await test.step( `And I see the "${ section }" section`, async function () {
				await pagePlugins.validateHasSection( section );
			} );
		}

		await test.step( 'When I click "Browse all free plugins"', async function () {
			await pagePlugins.clickBrowseAllFreePlugins();
		} );

		await test.step( 'Then I see the free plugins page', async function () {
			await pagePlugins.validateHasHeaderTitle( PluginsPage.freeSection );
		} );

		await test.step( 'When I navigate back via the "Discover" category', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pagePlugins.clickCategory( 'Discover' );
			} else {
				await pagePlugins.clickDropdownCategory( 'Discover' );
			}
		} );

		await test.step( 'Then I see the free plugins section', async function () {
			await pagePlugins.validateHasSection( PluginsPage.freeSection );
		} );

		if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
			await test.step( 'When I click "Browse all premium plugins"', async function () {
				await pagePlugins.clickBrowseAllPaidPlugins();
			} );

			await test.step( 'Then I see the premium plugins page', async function () {
				await pagePlugins.validateHasHeaderTitle( PluginsPage.paidSection );
			} );

			await test.step( 'When I navigate back via the "Discover" category', async function () {
				if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
					await pagePlugins.clickCategory( 'Discover' );
				} else {
					await pagePlugins.clickDropdownCategory( 'Discover' );
				}
			} );

			await test.step( 'Then I see the premium plugins section', async function () {
				await pagePlugins.validateHasSection( PluginsPage.paidSection );
			} );
		} else {
			await test.step( 'Then premium plugins are not shown on Jetpack sites', async function () {
				await pagePlugins.validateNotHasSection( PluginsPage.paidSection );
			} );
		}
	} );

	test( 'Validate featured plugins are displayed', async ( { page, pagePlugins } ) => {
		const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );

		await test.step( `Given I am authenticated as '${ testUser }'`, async function () {
			const testAccount = new TestAccount( testUser );
			await testAccount.authenticate( page );

			siteUrl = testAccount
				.getSiteURL( { protocol: false } )
				.replace( 'https://', '' )
				.replace( '/wp-admin', '' );
		} );

		await test.step( 'When I visit the plugins page', async function () {
			await pagePlugins.visit( siteUrl );
		} );

		const featuredPlugins = [
			'WooCommerce',
			'MailPoet – emails and newsletters in WordPress',
			'Jetpack CRM – Clients, Invoices, Leads, & Billing for WordPress',
		];

		for ( const plugin of featuredPlugins ) {
			await test.step( `Then I see "${ plugin }" in the featured section`, async function () {
				await pagePlugins.validateHasPluginOnSection( PluginsPage.featuredSection, plugin );
			} );
		}
	} );

	test( 'Browse and validate SEO category plugins', async ( { page, pagePlugins } ) => {
		const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );

		await test.step( `Given I am authenticated as '${ testUser }'`, async function () {
			const testAccount = new TestAccount( testUser );
			await testAccount.authenticate( page );

			siteUrl = testAccount
				.getSiteURL( { protocol: false } )
				.replace( 'https://', '' )
				.replace( '/wp-admin', '' );
		} );

		await test.step( 'When I visit the plugins page', async function () {
			await pagePlugins.visit( siteUrl );
		} );

		await test.step( 'And I navigate to the SEO category', async function () {
			await pagePlugins.validateCategoryButton(
				'Search Engine Optimization',
				envVariables.VIEWPORT_NAME !== 'mobile'
			);
		} );

		await test.step( 'Then I see the SEO category page', async function () {
			await page.waitForURL( new RegExp( `/plugins/browse/seo/${ siteUrl }$` ) );
			await expect( page ).toHaveURL( new RegExp( `/plugins/browse/seo/${ siteUrl }$` ) );
		} );

		await test.step( 'And I see "Yoast SEO" in the SEO category', async function () {
			await pagePlugins.validateHasPluginInCategory( 'Search Engine Optimization', 'Yoast SEO' );
		} );
	} );
} );
