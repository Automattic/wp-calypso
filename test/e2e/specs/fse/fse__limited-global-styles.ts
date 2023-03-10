/**
 * @group gutenberg
 */

import {
	DataHelper,
	TestAccount,
	FullSiteEditorPage,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Editor: Limited Global Styles' ), function () {
	let page: Page;
	let fullSiteEditorPage: FullSiteEditorPage;
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
	const siteSlug = credentials.testSites?.primary?.url as string;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );

		fullSiteEditorPage = new FullSiteEditorPage( page );
	} );

	it( 'Visit the site editor', async function () {
		await fullSiteEditorPage.visit( siteSlug );
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Edit' );
		await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
		await fullSiteEditorPage.closeNavSidebar();
	} );

	it( 'Open site styles', async function () {
		await fullSiteEditorPage.openSiteStyles();
	} );

	it( 'Select the "Try it out" option in the upgrade modal', async function () {
		await fullSiteEditorPage.tryGlobalStyles();
	} );

	it( 'Pick a non-default style variation', async function () {
		// The primary site of the `simpleSiteFreePlanUser` account has the Twenty Twenty-Two
		// theme which includes a "Blue" style variation. If the active theme on the site
		// ever changes, we'll need to update the name of this style variation.
		await fullSiteEditorPage.setStyleVariation( 'Blue' );
	} );

	it( 'Save the styles and check that the pre-save notice shows up', async function () {
		// On mobile, the styles is a popover panel that hides the success notification
		// checked by the "save" method, so let's always close it first to be safe. :)
		await fullSiteEditorPage.closeSiteStyles();
		await fullSiteEditorPage.save( { checkPreSaveNotices: true } );
	} );

	it( 'Reset styles to defaults', async function () {
		await fullSiteEditorPage.openSiteStyles();
		await fullSiteEditorPage.setStyleVariation( 'Default' );
	} );

	it( 'Save the styles and check that the pre-save notice does not show up', async function () {
		// On mobile, the styles is a popover panel that hides the success notification
		// checked by the "save" method, so let's always close it first to be safe. :)
		await fullSiteEditorPage.closeSiteStyles();
		await fullSiteEditorPage.save( { checkPreSaveNotices: true } );
	} );
} );
