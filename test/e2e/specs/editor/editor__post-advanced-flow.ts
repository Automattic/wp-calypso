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
	NoticeComponent,
	getTestAccountByFeature,
	envToFeatureKey,
	ElementHelper,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Advanced Post Flow` ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
	] );

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

	beforeAll( async function () {
		editorPage = new EditorPage( page, { target: features.siteType } );
	} );

	describe( 'Publish post', function () {
		it( 'Enter post title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Enter post content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		it( 'Validate post', async function () {
			await page.goto( postURL.href );

			// Work around issue:
			// https://github.com/Automattic/wp-calypso/issues/57503
			await ElementHelper.reloadAndRetry( page, validatePublishedPage );

			async function validatePublishedPage(): Promise< void > {
				await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
			}
		} );
	} );

	describe( 'Edit published post', function () {
		beforeAll( async () => {
			await postsPage.visit();
		} );

		it( 'Click on published post', async function () {
			await postsPage.clickPost( postTitle );
		} );

		it( 'Editor is shown', async function () {
			await editorPage.waitUntilLoaded();
		} );

		it( 'Append additional content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		it( 'Ensure published post contains additional content', async function () {
			await page.goto( postURL.href );
			await ParagraphBlock.validatePublishedContent( page, [ originalContent, additionalContent ] );
			await page.goBack();
		} );
	} );

	describe( 'Revert post to draft', function () {
		it( 'Switch to draft', async function () {
			await editorPage.unpublish();
		} );

		it( 'Ensure post is no longer visible', async function () {
			// It's important that we use another context to confirm that the
			// page was reverted to draft. It's also important that we DON'T use
			// a separate context to preview this page when it was previously
			// published, because it would get cached and wouldn't 404 until the
			// cache self-invalidates (300s period). This workaround is specific
			// for Atomic sites. See pMz3w-fZ0 for more info.
			const tmpPage = await browser.newPage();
			await tmpPage.goto( postURL.href );

			await tmpPage.waitForSelector( 'body.error404' );
			await tmpPage.close();
		} );
	} );

	describe( 'Trash post', function () {
		const successMessage = 'Post successfully moved to trash.';

		let noticeComponent: NoticeComponent;

		beforeAll( async function () {
			await postsPage.visit();
		} );

		it( 'Trash post', async function () {
			await postsPage.clickTab( 'Drafts' );
			await postsPage.clickMenuItemForPost( { title: postTitle, action: 'Trash' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			noticeComponent = new NoticeComponent( page );
			await noticeComponent.noticeShown( successMessage, {
				type: 'Success',
			} );
		} );

		it( 'Dismiss notice', async function () {
			// On mobile viewports the notice banner overlaps with the navtab.
			await noticeComponent.dismiss( successMessage );
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
			const noticeComponent = new NoticeComponent( page );
			await noticeComponent.noticeShown( 'Post successfully deleted', {
				type: 'Success',
			} );
		} );
	} );
} );
