/**
 * @group jetpack-remote-site
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	TestAccount,
	SidebarComponent,
	WritingSettingsPage,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	WpAdminMediaSettingsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

// We care about these settings in all Jetpack sites, but they are in a different place
// depending on whether the site is a WPCOM site or a remote site.
// So, we have to do some condition case logic here.
describe( DataHelper.createSuiteTitle( 'Jetpack Settings: Media' ), function () {
	let page: Page;

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	if ( envVariables.JETPACK_TARGET === 'remote-site' ) {
		describe( 'Under writing settings for a remote site', function () {
			let writingSettingsPage: WritingSettingsPage;

			it( 'Navigate to Settings > Writing', async function () {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Settings', 'Writing' );
				writingSettingsPage = new WritingSettingsPage( page );
			} );

			it( 'Toggle Carousel', async function () {
				await writingSettingsPage.toggleOn(
					'parent',
					'Transform standard image galleries into full-screen slideshows'
				);
			} );

			it( 'Toggle photo metadata', async function () {
				await writingSettingsPage.toggleOn(
					'child',
					'Show photo metadata in carousel, when available'
				);
			} );

			it( 'Select "Black" for carousel background color', async function () {
				await writingSettingsPage.selectCarouselBackgroundColor( 'Black' );
			} );
		} );
	} else {
		// WPCOM Site
		describe( 'Under media settings for a WPCOM site', function () {
			let wpAdminMediaSettingsPage: WpAdminMediaSettingsPage;

			it( 'Navigate to Settings > Media', async function () {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Settings', 'Media' );
				wpAdminMediaSettingsPage = new WpAdminMediaSettingsPage( page );
			} );

			it( 'Toggle Carousel', async function () {
				await wpAdminMediaSettingsPage.toggleEnableCarousel();
			} );

			it( 'Toggle photo metadata', async function () {
				await wpAdminMediaSettingsPage.toggleCarouselMetadata();
			} );

			it( 'Select "Black" for carousel background color', async function () {
				await wpAdminMediaSettingsPage.setBackGroundColor( 'Black' );
			} );
		} );
	}
} );
