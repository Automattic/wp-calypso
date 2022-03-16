/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	EditorPage,
	envVariables,
	TestAccount,
	PostsPage,
	ParagraphBlock,
	SnackbarNotificationComponent,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Advanced Post Flow` ), function () {
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	const postTitle = `Post Life Cycle: ${ DataHelper.getTimestamp() }`;
	const originalContent = DataHelper.getRandomPhrase();
	const additionalContent = 'Updated post content';

	let page: Page;
	let editorPage: EditorPage;
	let postsPage: PostsPage;
	let paragraphBlock: ParagraphBlock;
	let postURL: URL;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		postsPage = new PostsPage( page );
		await postsPage.visit();
		await postsPage.newPost();
	} );

	describe( 'Publish post', function () {
		it( 'Enter post title', async function () {
			editorPage = new EditorPage( page );
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Enter post content', async function () {
			const blockHandle = await editorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
			expect( postURL.href ).toBeDefined();
		} );

		it( 'Validate post', async function () {
			const testPage = await browser.newPage();
			await testPage.goto( postURL.href );

			await ParagraphBlock.validatePublishedContent( testPage, [ originalContent ] );
			await testPage.close();
		} );
	} );

	describe( 'Edit published post', function () {
		it( 'Navigate to Posts page', async function () {
			await postsPage.visit();
		} );

		it( 'Click on published post', async function () {
			await postsPage.clickPost( postTitle );
		} );

		it( 'Editor is shown', async function () {
			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();
		} );

		it( 'Append additional content', async function () {
			const blockHandle = await editorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		it( 'Published post contains additional post content', async function () {
			const testPage = await browser.newPage();
			await testPage.goto( postURL.href );

			await ParagraphBlock.validatePublishedContent( testPage, [
				originalContent,
				additionalContent,
			] );
			await testPage.close();
		} );
	} );

	describe( 'Revert post to draft', function () {
		it( 'Switch to draft', async function () {
			await editorPage.unpublish();
		} );

		it( 'Post is no longer visible', async function () {
			const testPage = await browser.newPage();
			await testPage.goto( postURL.href );
			await testPage.waitForSelector( 'div.error-404.not-found' );
			await testPage.close();
		} );
	} );

	describe( 'Trash post', function () {
		it( 'Trash post', async function () {
			await postsPage.visit();
			await postsPage.clickTab( 'Drafts' );
			await postsPage.clickMenuItemForPost( { title: postTitle, action: 'Trash' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			const snackbarNotificationComponent = new SnackbarNotificationComponent( page );
			await snackbarNotificationComponent.noticeShown( 'Post successfully moved to trash.', {
				type: 'Success',
			} );
		} );
	} );

	describe( 'Permanently delete post', function () {
		it( 'View trashed posts', async function () {
			await postsPage.clickTab( 'Trashed' );
		} );

		it( 'Hard trash post', async function () {
			await postsPage.clickMenuItemForPost( { title: postTitle, action: 'Delete Permanently' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			const snackbarNotificationComponent = new SnackbarNotificationComponent( page );
			await snackbarNotificationComponent.noticeShown( 'Post successfully deleted', {
				type: 'Success',
			} );
		} );
	} );
} );
