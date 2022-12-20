/**
 * @group calypso-pr
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
		await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
	} );

	it( 'Open site styles', async function () {
		await fullSiteEditorPage.openSiteStyles();
	} );

	it( 'Select the "Try it out" option in the upgrade modal', async function () {
		await fullSiteEditorPage.tryGlobalStyles();
	} );

	it( 'Update the global background color', async function () {
		await fullSiteEditorPage.setGlobalColorStyle( 'Background', {
			colorName: 'Primary',
		} );
	} );

	it( 'Save the styles', async function () {
		// On mobile, site styles is a popover panel that blocks the Save button.
		// So let's always close site styles first to be safe. :)
		await fullSiteEditorPage.closeSiteStyles();
		await fullSiteEditorPage.save( { preSaveSelectors: [ '.wpcom-global-styles-notice' ] } );
	} );

	it( 'Reset styles to defaults', async function () {
		await fullSiteEditorPage.openSiteStyles();
		await fullSiteEditorPage.setGlobalColorStyle( 'Background', {
			colorName: 'Primary',
		} );
		await fullSiteEditorPage.closeSiteStyles();
		await fullSiteEditorPage.save();
	} );
} );
