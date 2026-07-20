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
import { skipIfNotTrunk, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Editor: Advanced Post Flow' ),
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] },
	() => {
		skipIfNotTrunk();

		// Authentication setup.
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
		] );

		test( 'As a user, I can publish, edit, revert, trash and permanently delete a post', async ( {
			page,
			browser,
		} ) => {
			// The full post life cycle (publish, edit, revert, trash, delete) does
			// not fit the default 2-minute budget.
			test.setTimeout( 300 * 1000 );

			// Post content setup. The title must be unique across the parallel
			// projects (chrome, pixel) sharing the same site, and across retries:
			// the post is located by title on the Posts page list.
			const postTitle = `Post Life Cycle: ${ DataHelper.getTimestamp() } ${ DataHelper.getRandomPhrase() }`;
			const originalContent = DataHelper.getRandomPhrase();
			const additionalContent = 'Updated post content';

			let testAccount: TestAccount;
			let siteSlug: string;
			let editorPage: EditorPage;
			let postsPage: PostsPage;
			let paragraphBlock: ParagraphBlock;
			let postURL: URL;

			await test.step( 'Authenticate and setup the test', async () => {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				siteSlug = testAccount.getSiteURL( { protocol: false } );
			} );

			// Publish post

			await test.step( 'Start a new post from the Posts page', async () => {
				postsPage = new PostsPage( page );
				await postsPage.visit( { siteSlug } );
				await postsPage.newPost( { siteSlug } );
			} );

			await test.step( 'Enter post title', async () => {
				editorPage = new EditorPage( page );
				await editorPage.enterTitle( postTitle );
			} );

			await test.step( 'Enter post content', async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( originalContent );
			} );

			await test.step( 'Publish post', async () => {
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
			await test.step( 'Validate post', async () => {
				await page.goto( postURL.href );

				await ElementHelper.reloadAndRetry( page, async () => {
					await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
				} );
			} );

			// Edit published post

			await test.step( 'Re-open the published post from the Posts page', async () => {
				// Redefine the `EditorPage` without the `target`
				// optional parameter.
				// This is critical because even AT sites load with
				// an iframe when the post is opened from the
				// PostsPage.
				// See: https://github.com/Automattic/wp-calypso/issues/74925
				await postsPage.visit( { siteSlug } );
				await postsPage.clickPost( postTitle );
				editorPage = new EditorPage( page );
			} );

			await test.step( 'Editor is shown', async () => {
				await editorPage.waitUntilLoaded();
			} );

			await test.step( 'Append additional content', async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( additionalContent );
			} );

			await test.step( 'Publish updated post', async () => {
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
			await test.step( 'Ensure published post contains additional content', async () => {
				await page.goto( postURL.href );

				await ElementHelper.reloadAndRetry( page, async () => {
					await ParagraphBlock.validatePublishedContent( page, [
						originalContent,
						additionalContent,
					] );
				} );
			} );

			// Revert post to draft

			await test.step( 'Re-open the updated post from the Posts page', async () => {
				// See: https://github.com/Automattic/wp-calypso/issues/74925
				await postsPage.visit( { siteSlug } );
				await postsPage.clickPost( postTitle );
				editorPage = new EditorPage( page );
			} );

			await test.step( 'Switch to draft', async () => {
				await editorPage.unpublish();
			} );

			await test.step( 'Ensure post is no longer visible', async () => {
				// It's important that we use another context to confirm that the
				// page was reverted to draft. It's also important that we DON'T use
				// a separate context to preview this page when it was previously
				// published, because it would get cached and wouldn't 404 until the
				// cache self-invalidates (300s period). This workaround is specific
				// for Atomic sites. See pMz3w-fZ0 for more info.
				const tmpContext = await browser.newContext();
				const tmpPage = await tmpContext.newPage();
				await tmpPage.goto( postURL.href );

				await tmpPage.waitForSelector( 'body.error404' );
				await tmpContext.close();
			} );

			// Trash post

			await test.step( 'Trash post', async () => {
				await postsPage.visit( { siteSlug } );
				await postsPage.clickTab( 'Drafts' );
				await postsPage.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
			} );

			await test.step( 'Confirmation notice is shown', async () => {
				const noticeComponent = new WpAdminNoticeComponent( page );
				await noticeComponent.noticeShown( '1 post moved to the Trash.', {
					type: 'Updated',
				} );
			} );

			// Permanently delete post

			await test.step( 'View trashed posts', async () => {
				await postsPage.clickTab( 'Trash' );
			} );

			await test.step( 'Hard trash post', async () => {
				await postsPage.clickActionItemForPost( {
					title: postTitle,
					action: 'Delete Permanently',
				} );
			} );

			await test.step( 'Deletion confirmation notice is shown', async () => {
				const noticeComponent = new WpAdminNoticeComponent( page );
				await noticeComponent.noticeShown( '1 post permanently deleted', {
					type: 'Updated',
				} );
			} );
		} );
	}
);
