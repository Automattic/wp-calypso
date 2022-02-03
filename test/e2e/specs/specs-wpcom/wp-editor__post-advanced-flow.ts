/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	GutenbergEditorPage,
	envVariables,
	TestAccount,
	PostsPage,
	ParagraphBlock,
	EditorSettingsSidebarComponent,
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
	let gutenbergEditorPage: GutenbergEditorPage;
	let paragraphBlock: ParagraphBlock;
	let postURL: string;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.visit( 'post' );
	} );

	describe( 'Publish post', function () {
		it( 'Enter post title', async function () {
			await gutenbergEditorPage.enterTitle( postTitle );
		} );

		it( 'Enter post content', async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await gutenbergEditorPage.publish();
			expect( postURL ).toBeDefined();
		} );

		it( 'Validate post', async function () {
			const testPage = await browser.newPage();
			await testPage.goto( postURL );

			await ParagraphBlock.validatePublishedContent( testPage, [ originalContent ] );
			await testPage.close();
		} );
	} );

	describe( 'Edit published post', function () {
		let postsPage: PostsPage;

		it( 'Navigate to Posts page', async function () {
			postsPage = new PostsPage( page );
			await postsPage.visit();
		} );

		it( 'Click on published post', async function () {
			await postsPage.clickPost( postTitle );
		} );

		it( 'Editor is shown', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.waitUntilLoaded();
		} );

		it( 'Append additional content', async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await gutenbergEditorPage.update();
		} );

		it( 'Published post contains additional post content', async function () {
			const testPage = await browser.newPage();
			await testPage.goto( postURL );

			await ParagraphBlock.validatePublishedContent( testPage, [
				originalContent,
				additionalContent,
			] );
			await testPage.close();
		} );
	} );

	describe( 'Revert post to draft', function () {
		it( 'Switch to draft', async function () {
			await gutenbergEditorPage.unpublish();
		} );

		it( 'Post is no longer visible', async function () {
			const testPage = await browser.newPage();
			await testPage.goto( postURL );
			await testPage.waitForSelector( 'div.error-404.not-found' );
			await testPage.close();
		} );
	} );

	describe( 'Trash post', function () {
		it( 'Trash post', async function () {
			await gutenbergEditorPage.openSettings();
			const frame = await gutenbergEditorPage.getEditorFrame();

			const editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
			await editorSettingsSidebarComponent.clickTab( 'Post' );
			await editorSettingsSidebarComponent.trashPost();
		} );

		it( 'User is navigated to Posts > Trashed page', async function () {
			await page.waitForURL( /.*posts\/trashed.*/, { waitUntil: 'load' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			const snackbarNotificationComponent = new SnackbarNotificationComponent( page );
			await snackbarNotificationComponent.validateNoticeShown(
				'Post successfully moved to trash.',
				{ type: 'Success' }
			);
		} );
	} );

	describe( 'Permanently delete post', function () {
		it( 'Hard trash post', async function () {
			const postsPage = new PostsPage( page );
			await postsPage.clickMenuItemForPost( { title: postTitle, action: 'Delete Permanently' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			const snackbarNotificationComponent = new SnackbarNotificationComponent( page );
			await snackbarNotificationComponent.validateNoticeShown( 'Post successfully deleted', {
				type: 'Success',
			} );
		} );
	} );
} );
