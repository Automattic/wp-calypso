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
	WpAdminNoticeComponent,
	getTestAccountByFeature,
	envToFeatureKey,
	ElementHelper,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( `Editor: Advanced Post Flow`, function () {
	// Authentication setup.
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
	] );

	// Post content setup.
	const postTitle = `Post Life Cycle: ${ DataHelper.getTimestamp() }`;
	const originalContent = DataHelper.getRandomPhrase();
	const additionalContent = 'Updated post content';

	let page: Page;
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let postsPage: PostsPage;
	let paragraphBlock: ParagraphBlock;
	let postURL: URL;

	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	describe( 'Publish post', function () {
		it( 'Start a new post from the Posts page', async function () {
			postsPage = new PostsPage( page );
			await postsPage.visit();
			await postsPage.newPost();
		} );

		it( 'Enter post title', async function () {
			editorPage = new EditorPage( page );
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Enter post content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		/**
		 * Validates post in the same tab to work around an issue with AT caching.
		 *
		 * @see https://github.com/Automattic/wp-calypso/pull/67964
		 *
		 * Retries due to possible cache issue.
		 * @see https://github.com/Automattic/wp-calypso/issues/57503
		 */
		it( 'Validate post', async function () {
			await page.goto( postURL.href );

			await ElementHelper.reloadAndRetry( page, validatePublishedPage );

			async function validatePublishedPage(): Promise< void > {
				await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
			}
		} );
	} );

	describe( 'Edit published post', function () {
		it( 'Re-open the published post from the Posts page', async function () {
			// Redefine the `EditorPage` without the `target`
			// optional parameter.
			// This is critical because even AT sites load with
			// an iframe when the post is opened from the
			// PostsPage.
			// See: https://github.com/Automattic/wp-calypso/issues/74925
			await postsPage.visit();
			await postsPage.clickPost( postTitle );
			editorPage = new EditorPage( page );
		} );

		it( 'Editor is shown', async function () {
			await editorPage.waitUntilLoaded();
		} );

		it( 'Append additional content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		/**
		 * Validates post in the same tab to work around an issue with AT caching.
		 *
		 * @see https://github.com/Automattic/wp-calypso/pull/67964
		 *
		 * Retries due to possible cache issue.
		 * @see https://github.com/Automattic/wp-calypso/issues/57503
		 */
		it( 'Ensure published post contains additional content', async function () {
			await page.goto( postURL.href );

			await ElementHelper.reloadAndRetry( page, validatePublishedPage );

			async function validatePublishedPage(): Promise< void > {
				await ParagraphBlock.validatePublishedContent( page, [
					originalContent,
					additionalContent,
				] );
			}
		} );
	} );

	describe( 'Revert post to draft', function () {
		it( 'Re-open the published post from the Posts page', async function () {
			// See: https://github.com/Automattic/wp-calypso/issues/74925
			await postsPage.visit();
			await postsPage.clickPost( postTitle );
			editorPage = new EditorPage( page );
		} );

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
		beforeAll( async function () {
			await postsPage.visit();
		} );

		it( 'Trash post', async function () {
			await postsPage.clickTab( 'Drafts' );
			await postsPage.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post moved to the Trash.', {
				type: 'Updated',
			} );
		} );
	} );

	describe( 'Permanently delete post', function () {
		it( 'View trashed posts', async function () {
			await postsPage.clickTab( 'Trash' );
		} );

		it( 'Hard trash post', async function () {
			await postsPage.clickActionItemForPost( { title: postTitle, action: 'Delete Permanently' } );
		} );

		it( 'Confirmation notice is shown', async function () {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post permanently deleted', {
				type: 'Updated',
			} );
		} );
	} );
} );
