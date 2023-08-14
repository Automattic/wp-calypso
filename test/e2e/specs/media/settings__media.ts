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
 * Keywords: Jetpack, Media, Carousel
 */
describe( DataHelper.createSuiteTitle( 'Jetpack Settings: Media' ), function () {
	let page: Page;

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	let wpAdminMediaSettingsPage: WpAdminMediaSettingsPage;

	it( 'Navigate to Settings > Media', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Settings', 'Media' );
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
} );
