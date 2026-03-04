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
	DataHelper.createSuiteTitle( 'Editor: Advanced Post Flow' ),
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
			test( 'Start a new post from the Posts page', async () => {
				postsPage = new PostsPage( page );
				await postsPage.visit();
				await postsPage.newPost();
			} );

			test( 'Enter post title', async () => {
				editorPage = new EditorPage( page );
				await editorPage.enterTitle( postTitle );
			} );

			test( 'Enter post content', async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( originalContent );
			} );

			test( 'Publish post', async () => {
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
			test( 'Validate post', async () => {
				await page.goto( postURL.href );

				await ElementHelper.reloadAndRetry( page, validatePublishedPage );

				async function validatePublishedPage(): Promise< void > {
					await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
				}
			} );
		} );

		test.describe( 'Edit published post', () => {
			test( 'Re-open the published post from the Posts page', async () => {
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

			test( 'Editor is shown', async () => {
				await editorPage.waitUntilLoaded();
			} );

			test( 'Append additional content', async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( additionalContent );
			} );

			test( 'Publish post', async () => {
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
			test( 'Ensure published post contains additional content', async () => {
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
			test( 'Re-open the published post from the Posts page', async () => {
				// See: https://github.com/Automattic/wp-calypso/issues/74925
				await postsPage.visit();
				await postsPage.clickPost( postTitle );
				editorPage = new EditorPage( page );
			} );

			test( 'Switch to draft', async () => {
				await editorPage.unpublish();
			} );

			test( 'Ensure post is no longer visible', async () => {
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

			test( 'Trash post', async () => {
				await postsPage.clickTab( 'Drafts' );
				await postsPage.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
			} );

			test( 'Confirmation notice is shown', async () => {
				const noticeComponent = new WpAdminNoticeComponent( page );
				await noticeComponent.noticeShown( '1 post moved to the Trash.', {
					type: 'Updated',
				} );
			} );
		} );

		test.describe( 'Permanently delete post', () => {
			test( 'View trashed posts', async () => {
				await postsPage.clickTab( 'Trash' );
			} );

			test( 'Hard trash post', async () => {
				await postsPage.clickActionItemForPost( {
					title: postTitle,
					action: 'Delete Permanently',
				} );
			} );

			test( 'Confirmation notice is shown', async () => {
				const noticeComponent = new WpAdminNoticeComponent( page );
				await noticeComponent.noticeShown( '1 post permanently deleted', {
					type: 'Updated',
				} );
			} );
		} );
	}
);
