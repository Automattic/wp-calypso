/**
 * @group jetpack
 */

import {
	DataHelper,
	TestAccount,
	SidebarComponent,
	WritingSettingsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Jetpack Settings: Media' ), function () {
	let page: Page;
	let writingSettingsPage: WritingSettingsPage;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'jetpackUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Settings > Writing', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Settings', 'Writing' );
	} );

	it( 'Media setting section is visible', async function () {
		writingSettingsPage = new WritingSettingsPage( page );
		await writingSettingsPage.validateSection( 'Media' );
	} );

	it( 'Enable Carousel', async function () {
		await writingSettingsPage.toggleOn(
			'parent',
			'Transform standard image galleries into full-screen slideshows'
		);
	} );

	it( 'Enable photo metadata', async function () {
		await writingSettingsPage.toggleOn(
			'child',
			'Show photo metadata in carousel, when available'
		);
	} );

	it( 'Select "Black" for carousel background color', async function () {
		await writingSettingsPage.selectCarouselBackgroundColor( 'Black' );
	} );
} );
