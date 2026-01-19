import {
	EditorPage,
	PostsPage,
	ParagraphBlock,
	WpAdminNoticeComponent,
	ElementHelper,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Editor: Advanced Post Flow', { tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] }, () => {
	test( 'As a user, I can manage a post lifecycle (publish, edit, revert to draft, trash, delete)', async ( {
		browser,
		page,
		accountGivenByEnvironment,
		helperData,
	} ) => {
		const postTitle = `Post Life Cycle: ${ helperData.getTimestamp() }`;
		const originalContent = helperData.getRandomPhrase();
		const additionalContent = 'Updated post content';

		let editorPage: EditorPage;
		let postsPage: PostsPage;
		let paragraphBlock: ParagraphBlock;
		let postURL: URL;

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I start a new post from the Posts page', async function () {
			postsPage = new PostsPage( page );
			await postsPage.visit();
			await postsPage.newPost();
		} );

		await test.step( 'And I enter post title', async function () {
			editorPage = new EditorPage( page );
			await editorPage.enterTitle( postTitle );
		} );

		await test.step( 'And I enter post content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		await test.step( 'And I publish the post', async function () {
			postURL = await editorPage.publish();
		} );

		await test.step( 'Then the published post contains the original content', async function () {
			await page.goto( postURL.href );

			await ElementHelper.reloadAndRetry( page, async () => {
				await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
			} );
		} );

		await test.step( 'When I re-open the published post from the Posts page', async function () {
			await postsPage.visit();
			await postsPage.clickPost( postTitle );
			editorPage = new EditorPage( page );
		} );

		await test.step( 'And the editor is loaded', async function () {
			await editorPage.waitUntilLoaded();
		} );

		await test.step( 'And I append additional content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		await test.step( 'And I publish the post', async function () {
			postURL = await editorPage.publish();
		} );

		await test.step( 'Then the published post contains additional content', async function () {
			await page.goto( postURL.href );

			await ElementHelper.reloadAndRetry( page, async () => {
				await ParagraphBlock.validatePublishedContent( page, [
					originalContent,
					additionalContent,
				] );
			} );
		} );

		await test.step( 'When I re-open the published post from the Posts page', async function () {
			await postsPage.visit();
			await postsPage.clickPost( postTitle );
			editorPage = new EditorPage( page );
		} );

		await test.step( 'And I switch to draft', async function () {
			await editorPage.unpublish();
		} );

		await test.step( 'Then the post is no longer visible to the public', async function () {
			const tmpPage = await browser.newPage();
			await tmpPage.goto( postURL.href );
			await tmpPage.waitForSelector( 'body.error404' );
			await tmpPage.close();
		} );

		await test.step( 'When I visit the Posts page', async function () {
			await postsPage.visit();
		} );

		await test.step( 'And I trash the post', async function () {
			await postsPage.clickTab( 'Drafts' );
			await postsPage.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
		} );

		await test.step( 'Then a confirmation notice is shown', async function () {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post moved to the Trash.', {
				type: 'Updated',
			} );
		} );

		await test.step( 'When I view trashed posts', async function () {
			await postsPage.clickTab( 'Trash' );
		} );

		await test.step( 'And I permanently delete the post', async function () {
			await postsPage.clickActionItemForPost( { title: postTitle, action: 'Delete Permanently' } );
		} );

		await test.step( 'Then a confirmation notice is shown', async function () {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post permanently deleted', {
				type: 'Updated',
			} );
		} );
	} );
} );
