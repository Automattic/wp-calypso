/**
 * @group gutenberg
 */

import {
	getTestAccountByFeature,
	envVariables,
	TestAccount,
	FullSiteEditorPage,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Ensures the Full Site Editor's Limited Global Styles feature is functional.
 *
 * Note: test user for this spec requires the use of FSE theme with style variations
 * (eg. Twenty Twenty-Three).
 *
 * @see https://github.com/Automattic/wp-calypso/issues/78107
 *
 * Note: We skip Atomic sites because they are not affected by Limited Global Styles.
 * @see https://github.com/Automattic/wp-calypso/pull/71333#issuecomment-1592490057
 *
 * Keywords: FSE, Full Site Editor, Global Styles, Gutenberg
 */
skipDescribeIf( envVariables.TEST_ON_ATOMIC )( 'Site Editor: Limited Global Styles', function () {
	let page: Page;
	let fullSiteEditorPage: FullSiteEditorPage;
	let testAccount: TestAccount;

	const accountName = getTestAccountByFeature( {
		gutenberg: envVariables.GUTENBERG_EDGE ? 'edge' : 'stable',
		siteType: 'simple',
		variant: 'siteEditor',
	} );

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
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
		// Style variation names depend on the theme.
		// If the spec ever begins to permafail, check here.
		await fullSiteEditorPage.setStyleVariation( 'Aubergine' );
	} );

	it( 'Reset styles to defaults and check that the save notice does not show up', async function () {
		await fullSiteEditorPage.setStyleVariation( 'Default' );
	} );
} );
