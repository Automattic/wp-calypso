/**
 * @group gutenberg
 * @group calypso-pr
 */

import { DataHelper, EditorPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Navbar` ), function () {
	let page: Page;
	let editorPage: EditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		const testAccount = new TestAccount( 'simpleSitePersonalPlanUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await editorPage.visit( 'post' );
	} );

	it( 'Return to Calypso dashboard', async function () {
		await editorPage.exitEditor();
	} );
} );
