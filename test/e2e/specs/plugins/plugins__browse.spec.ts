import {
	DataHelper,
	PluginsPage,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { skipIfNotTrunk, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Plugins: Browse' ),
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_REMOTE_SITE ] },
	() => {
		skipIfNotTrunk();

		test( 'As a user, I can browse plugins on the plugins page', async ( { page } ) => {
			let pluginsPage: PluginsPage;
			let siteUrl: string;

			await test.step( 'Authenticate', async () => {
				const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
					{
						gutenberg: 'stable',
						siteType: 'simple',
						accountName: 'defaultUser',
					},
				] );
				const testAccount = new TestAccount( testUser );
				await testAccount.authenticate( page );

				siteUrl = testAccount
					.getSiteURL( { protocol: false } )
					.replace( 'https://', '' )
					.replace( '/wp-admin', '' );
			} );

			await test.step( 'Visit plugins page', async () => {
				pluginsPage = new PluginsPage( page );
				await pluginsPage.visit( siteUrl );
			} );

			const expectedSections = [ PluginsPage.featuredSection, PluginsPage.freeSection ];
			if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
				expectedSections.push( PluginsPage.paidSection );
			}

			for ( const section of expectedSections ) {
				await test.step( `Plugins page loads ${ section } section`, async () => {
					await pluginsPage.validateHasSection( section );
				} );
			}

			await test.step( 'Can browse all free plugins', async () => {
				await pluginsPage.clickBrowseAllFreePlugins();
				await pluginsPage.validateHasHeaderTitle( PluginsPage.freeSection );
			} );

			await test.step( 'Can return via category', async () => {
				if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
					await pluginsPage.clickCategory( 'Discover' );
				} else {
					await pluginsPage.clickDropdownCategory( 'Discover' );
				}
				await pluginsPage.validateHasSection( PluginsPage.freeSection );
			} );

			if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
				await test.step( 'Can browse all premium plugins', async () => {
					await pluginsPage.clickBrowseAllPaidPlugins();
					await pluginsPage.validateHasHeaderTitle( PluginsPage.paidSection );
				} );

				await test.step( 'Can return via breadcrumb from premium plugins', async () => {
					if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
						await pluginsPage.clickCategory( 'Discover' );
					} else {
						await pluginsPage.clickDropdownCategory( 'Discover' );
					}
					await pluginsPage.validateHasSection( PluginsPage.paidSection );
				} );
			} else {
				await test.step( 'Plugins page does not load premium plugins on Jetpack sites', async () => {
					await pluginsPage.validateNotHasSection( PluginsPage.paidSection );
				} );
			}

			for ( const plugin of [
				'WooCommerce',
				'MailPoet – emails and newsletters in WordPress',
				'Jetpack CRM – Clients, Invoices, Leads, & Billing for WordPress',
			] ) {
				await test.step( `Featured Plugins section should show the ${ plugin } plugin`, async () => {
					await pluginsPage.validateHasPluginOnSection( PluginsPage.featuredSection, plugin );
				} );
			}

			await test.step( 'Can browse SEO category', async () => {
				await pluginsPage.validateCategoryButton(
					'Search Engine Optimization',
					envVariables.VIEWPORT_NAME !== 'mobile' ? true : false
				);
				await page.waitForURL( new RegExp( `/plugins/browse/seo/${ siteUrl }$` ) );
			} );

			await test.step( 'SEO category lists plugins', async () => {
				await pluginsPage.validateCategoryHasPlugins( 'Search Engine Optimization' );
			} );
		} );
	}
);
