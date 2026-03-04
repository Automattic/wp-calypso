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
import { test, tags } from '../../lib/pw-base';

test.describe.serial(
	'Editor: Advanced Post Flow',
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
		] );

		const postTitle = `Post Life Cycle: ${ DataHelper.getTimestamp() }`;
		const originalContent = DataHelper.getRandomPhrase();
		const additionalContent = 'Updated post content';

		let page: Page;
		let browser: Browser;
		let editorPage: EditorPage;
		let postsPage: PostsPage;
		let paragraphBlock: ParagraphBlock;
		let postURL: URL;

		test.beforeAll( async ( { browser: browserFixture } ) => {
			browser = browserFixture;
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		test.describe( 'Publish post', () => {
			test( 'Given user is authenticated When navigating to Posts page And creating a new post Then the editor opens', async () => {
				postsPage = new PostsPage( page );
				await postsPage.visit();
				await postsPage.newPost();
			} );

			test( 'When user enters the post title', async () => {
				editorPage = new EditorPage( page );
				await editorPage.enterTitle( postTitle );
			} );

			test( 'And user enters post content', async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( originalContent );
			} );

			test( 'When user publishes the post Then a post URL is returned', async () => {
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
			test( 'Then the published post content is visible on the frontend', async () => {
				await page.goto( postURL.href );

				await ElementHelper.reloadAndRetry( page, validatePublishedPage );

				async function validatePublishedPage(): Promise< void > {
					await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
				}
			} );
		} );

		test.describe( 'Edit published post', () => {
			test( 'Given a published post exists When user re-opens it from the Posts page Then the editor loads', async () => {
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

			test( 'And the editor is shown', async () => {
				await editorPage.waitUntilLoaded();
			} );

			test( 'When user appends additional content', async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( additionalContent );
			} );

			test( 'And user republishes the post', async () => {
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
			test( 'Then the published post contains the original and additional content', async () => {
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

		test.describe( 'Revert post to draft', () => {
			test( 'Given an edited published post When user re-opens it from the Posts page Then the editor loads', async () => {
				await postsPage.visit();
				await postsPage.clickPost( postTitle );
				editorPage = new EditorPage( page );
			} );

			test( 'When user reverts the post to draft', async () => {
				await editorPage.unpublish();
			} );

			test( 'Then the post URL returns a 404', async () => {
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

		test.describe( 'Trash post', () => {
			test.beforeAll( async () => {
				await postsPage.visit();
			} );

			test( 'When user trashes the draft post', async () => {
				await postsPage.clickTab( 'Drafts' );
				await postsPage.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
			} );

			test( 'Then a trash confirmation notice is shown', async () => {
				const noticeComponent = new WpAdminNoticeComponent( page );
				await noticeComponent.noticeShown( '1 post moved to the Trash.', {
					type: 'Updated',
				} );
			} );
		} );

		test.describe( 'Permanently delete post', () => {
			test( 'Given user navigates to the Trash tab', async () => {
				await postsPage.clickTab( 'Trash' );
			} );

			test( 'When user permanently deletes the post', async () => {
				await postsPage.clickActionItemForPost( {
					title: postTitle,
					action: 'Delete Permanently',
				} );
			} );

			test( 'Then a permanent deletion confirmation notice is shown', async () => {
				const noticeComponent = new WpAdminNoticeComponent( page );
				await noticeComponent.noticeShown( '1 post permanently deleted', {
					type: 'Updated',
				} );
			} );
		} );
	}
);
