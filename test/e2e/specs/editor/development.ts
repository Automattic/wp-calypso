/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	TestAccount,
	EditorPublishPanelComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

const title = DataHelper.getRandomPhrase();

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	const accountName = 'e2eflowtestingmanual1638568342';

	beforeAll( async () => {
		page = await browser.newPage();
		gutenbergEditorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await gutenbergEditorPage.visit( 'post' );
	} );

	describe( 'Blocks', function () {
		it( 'Enter post title', async function () {
			await gutenbergEditorPage.enterTitle( title );
		} );
	} );
	describe( 'Publish', function () {
		it( 'Publish and visit post', async function () {
			const frame = await gutenbergEditorPage.getEditorFrame();
			const temp = new EditorPublishPanelComponent( page, frame );
			const url = await temp.publish();
			console.log( url );
		} );
	} );
} );
