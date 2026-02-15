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
import { Page, Browser } from 'playwright';
import { test, tags } from '../../lib/pw-base';

test.describe( 'Editor: Advanced Post Flow', { tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] }, () => {
	test.skip( ( { viewportName } ) => viewportName === 'mobile', 'Skipped on mobile viewports' );

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
	let browser: Browser;
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let postsPage: PostsPage;
	let paragraphBlock: ParagraphBlock;
	let postURL: URL;

	test.beforeAll( async ( { browser: browserFixture } ) => {
		browser = browserFixture;
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	test.describe( 'Publish post', () => {
		test( 'Given user on Posts page When creating new post Then editor loads', async () => {
			postsPage = new PostsPage( page );
			await postsPage.visit();
			await postsPage.newPost();
		} );

		test( 'Given editor loaded When entering post title Then title is set', async () => {
			editorPage = new EditorPage( page );
			await editorPage.enterTitle( postTitle );
		} );

		test( 'Given editor loaded When adding paragraph block Then content is added', async () => {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		test( 'Given post has content When publishing Then post URL is generated', async () => {
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
		test( 'Given post published When viewing frontend Then content is visible', async () => {
			await page.goto( postURL.href );

			await ElementHelper.reloadAndRetry( page, validatePublishedPage );

			async function validatePublishedPage(): Promise< void > {
				await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
			}
		} );
	} );

	test.describe( 'Edit published post', () => {
		test( 'Given published post When reopening from Posts page Then editor opens', async () => {
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

		test( 'Given editor opening When it loads Then editor is ready', async () => {
			await editorPage.waitUntilLoaded();
		} );

		test( 'Given editor loaded When appending paragraph block Then content is added', async () => {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		test( 'Given post updated When publishing Then changes are saved', async () => {
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
		test( 'Given updated post When viewing frontend Then all content is visible', async () => {
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
		test( 'Given published post When reopening from Posts page Then editor opens', async () => {
			// See: https://github.com/Automattic/wp-calypso/issues/74925
			await postsPage.visit();
			await postsPage.clickPost( postTitle );
			editorPage = new EditorPage( page );
		} );

		test( 'Given editor loaded When switching to draft Then post is unpublished', async () => {
			await editorPage.unpublish();
		} );

		test( 'Given post unpublished When accessing URL Then 404 is returned', async () => {
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

		test( 'Given draft post When moving to trash Then post is trashed', async () => {
			await postsPage.clickTab( 'Drafts' );
			await postsPage.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
		} );

		test( 'Given post trashed Then confirmation notice is shown', async () => {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post moved to the Trash.', {
				type: 'Updated',
			} );
		} );
	} );

	test.describe( 'Permanently delete post', () => {
		test( 'Given trashed posts When viewing trash tab Then posts are listed', async () => {
			await postsPage.clickTab( 'Trash' );
		} );

		test( 'Given post in trash When permanently deleting Then post is removed', async () => {
			await postsPage.clickActionItemForPost( {
				title: postTitle,
				action: 'Delete Permanently',
			} );
		} );

		test( 'Given post deleted Then confirmation notice is shown', async () => {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post permanently deleted', {
				type: 'Updated',
			} );
		} );
	} );
} );
