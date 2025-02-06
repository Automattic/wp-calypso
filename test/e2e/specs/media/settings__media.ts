/**
 * @group jetpack-remote-site
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	TestAccount,
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

		// Atomic tests sites might have local users, so the Jetpack SSO login will
		// show up when visiting the Jetpack dashboard directly. We can bypass it if
		// we simulate a redirect from Calypso to WP Admin with a hardcoded referer.
		// @see https://github.com/Automattic/jetpack/blob/12b3b9a4771169398d4e1982573aaec820babc17/projects/plugins/wpcomsh/wpcomsh.php#L230-L254
		const siteUrl = testAccount.getSiteURL( { protocol: true } );
		await page.goto( `${ siteUrl }wp-admin/`, {
			timeout: 15 * 1000,
			referer: 'https://wordpress.com/',
		} );
	} );

	if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
		// For WPCOM hosted sites.
		let wpAdminMediaSettingsPage: WpAdminMediaSettingsPage;

		it( 'Navigate to Settings > Media', async function () {
			await page.goto( `${ testAccount.getSiteURL() }wp-admin/options-media.php` );
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
