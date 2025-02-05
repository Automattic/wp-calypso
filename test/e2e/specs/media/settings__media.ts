/**
 * @group jetpack-remote-site
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	TestAccount,
	SidebarComponent,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	WpAdminMediaSettingsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipItIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Checks for the presence of media presentation option modified by
 * Jetpack.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/76266
 *
 * Keywords: Jetpack, Media, Carousel, Settings
 */
describe( DataHelper.createSuiteTitle( 'Jetpack Settings: Media' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );

		if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
			// Switching to or logging into eCommerce plan sites inevitably
			// loads WP-Admin instead of Calypso, but the rediret occurs
			// only after Calypso attempts to load.
			await testAccount.authenticate( page, { url: /wp-admin/ } );
		} else {
			await testAccount.authenticate( page );
		}
	} );

	if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
		// For WPCOM hosted sites.
		let wpAdminMediaSettingsPage: WpAdminMediaSettingsPage;

		it( 'Navigate to Settings > Media', async function () {
			// eCommerce plan loads WP-Admin for home dashboard,
			// so instead navigate straight to the Media page.
			if ( testAccount.accountName === 'jetpackAtomicEcommPlanUser' ) {
				await page.goto( `${ testAccount.getSiteURL() }wp-admin/options-media.php` );
			} else {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Settings', 'Media' );
			}
			wpAdminMediaSettingsPage = new WpAdminMediaSettingsPage( page );
		} );

		// This step is not applicable for sites on Atomic infrastructure, as the checkbox
		// is physically not present.
		skipItIf( envVariables.TEST_ON_ATOMIC === true )( 'Toggle Carousel', async function () {
			await wpAdminMediaSettingsPage.toggleEnableCarousel();
		} );

		it( 'Toggle photo metadata', async function () {
			await wpAdminMediaSettingsPage.toggleCarouselMetadata();
		} );

		it( 'Select "Black" for carousel background color', async function () {
			await wpAdminMediaSettingsPage.setBackGroundColor( 'Black' );
		} );
	}
} );
