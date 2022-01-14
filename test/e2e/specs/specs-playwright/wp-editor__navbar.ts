/**
 * @group gutenberg
 * @group calypso-pr
 */

import { DataHelper, GutenbergEditorPage, setupHooks, TestAccount } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Editor: Navbar` ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;

	setupHooks( async ( args ) => {
		page = args.page;
		gutenbergEditorPage = new GutenbergEditorPage( page );
		const testAccount = new TestAccount( 'simpleSitePersonalPlanUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( 'Return to Calypso dashboard', async function () {
		const gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.returnToCalypsoDashboard();
	} );
} );
