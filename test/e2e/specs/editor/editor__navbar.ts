/**
 * @group gutenberg
 * @group calypso-pr
 */

import { DataHelper, GutenbergEditorPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Navbar` ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		gutenbergEditorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( 'simpleSitePersonalPlanUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( 'Return to Calypso dashboard', async function () {
		await gutenbergEditorPage.exitEditor();
	} );
} );
