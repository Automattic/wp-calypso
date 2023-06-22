/**
 * @group gutenberg
 */

import { envVariables, TestAccount, FullSiteEditorPage } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Note: test user for this spec requires the use of FSE theme with
 * style variations (eg. Twenty Twenty-Three).
 *
 * @see https://github.com/Automattic/wp-calypso/issues/78107
 *
 * We skip Atomic sites because they are not affected by Limited Global Styles.
 *
 * @see https://github.com/Automattic/wp-calypso/pull/71333#issuecomment-1592490057
 */
skipDescribeIf( envVariables.TEST_ON_ATOMIC )( 'Site Editor: Limited Global Styles', function () {
	let page: Page;
	let fullSiteEditorPage: FullSiteEditorPage;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );

		fullSiteEditorPage = new FullSiteEditorPage( page );
	} );

	it( 'Visit the site editor', async function () {
		await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: true } ) );
		await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );

		await fullSiteEditorPage.ensureNavigationTopLevel();
	} );

	it( 'Open site styles', async function () {
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Styles' );
	} );

	it( 'Select the "Try it out" option in the upgrade modal', async function () {
		await fullSiteEditorPage.tryGlobalStyles();
	} );

	it( 'Pick a non-default style variation and check that the save notice shows up', async function () {
		// The primary site of the `simpleSiteFreePlanUser` account has the Twenty Twenty-Two
		// theme which includes a "Blue" style variation. If the active theme on the site
		// ever changes, we'll need to update the name of this style variation.
		await fullSiteEditorPage.setStyleVariation( 'Blue' );
	} );

	it( 'Reset styles to defaults and check that the save notice does not show up', async function () {
		await fullSiteEditorPage.setStyleVariation( 'Default' );
	} );
} );
