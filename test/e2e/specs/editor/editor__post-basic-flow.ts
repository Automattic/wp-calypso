/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	PublishedPostPage,
	skipItIf,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

const quote =
	'The problem with quotes on the Internet is that it is hard to verify their authenticity. \n— Abraham Lincoln';
const title = DataHelper.getRandomPhrase();
const category = 'Uncategorized';
const tag = 'test-tag';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	let page: Page;
	let editorPage: GutenbergEditorPage;
	let publishedPostPage: PublishedPostPage;
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await editorPage.visit( 'post' );
	} );

	describe( 'Blocks', function () {
		it( 'Enter post title', async function () {
			await editorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await editorPage.enterText( quote );
		} );
	} );

	describe( 'Patterns', function () {
		const patternName = 'About Me';

		it( `Add ${ patternName } pattern`, async function () {
			await editorPage.addPattern( patternName );
		} );
	} );

	describe( 'Categories and Tags', function () {
		it( 'Open settings', async function () {
			await editorPage.openSettings();
		} );

		it( 'Add post category', async function () {
			await editorPage.selectCategory( category );
		} );

		it( 'Add post tag', async function () {
			await editorPage.addTag( tag );
		} );
	} );

	describe( 'Preview', function () {
		let previewPage: Page;

		// This step is required on mobile, but doesn't hurt anything on desktop, so avoiding conditional.
		it( 'Close settings sidebar', async function () {
			await editorPage.closeSettings();
		} );

		it( 'Launch preview', async function () {
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				previewPage = await editorPage.previewAsMobile();
			} else {
				await editorPage.previewAsDesktop( 'Mobile' );
			}
		} );

		it( 'Close preview', async function () {
			if ( previewPage ) {
				// Mobile path - close the new page.
				await previewPage.close();
			} else {
				// Desktop path - restore the Desktop view.
				await editorPage.closePreview();
			}
		} );

		// Step skipped for mobile, since previewing naturally saves the post, rendering this step unnecessary.
		skipItIf( envVariables.VIEWPORT_NAME === 'mobile' )( 'Save draft', async function () {
			await editorPage.saveDraft();
		} );
	} );

	describe( 'Publish', function () {
		it( 'Publish and visit post', async function () {
			const publishedURL: URL = await editorPage.publish( { visit: true } );
			expect( publishedURL.href ).toStrictEqual( page.url() );
		} );

		it( 'Post content is found in published post', async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.validateTextInPost( title );
			await publishedPostPage.validateTextInPost( quote );
		} );

		it( 'Post metadata is found in published post', async function () {
			await publishedPostPage.validateTextInPost( category );
			await publishedPostPage.validateTextInPost( tag );
		} );
	} );
} );
