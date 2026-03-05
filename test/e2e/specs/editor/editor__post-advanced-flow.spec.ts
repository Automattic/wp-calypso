import {
	DataHelper,
	EditorPage,
	ElementHelper,
	ParagraphBlock,
	PostsPage,
	TestAccount,
	WpAdminNoticeComponent,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Editor: Advanced Post Flow', { tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] }, () => {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
	] );

	const postTitle = `Post Life Cycle: ${ DataHelper.getTimestamp() }`;
	const originalContent = DataHelper.getRandomPhrase();
	const additionalContent = 'Updated post content';

	test( 'As a user, I can manage the full lifecycle of a post', async ( { page } ) => {
		let testAccount: TestAccount;
		let editorPage: EditorPage;
		let postsPage: PostsPage;
		let postURL: URL;

		await test.step( 'Given I am authenticated', async () => {
			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		await test.step( 'When I start a new post from the Posts page', async () => {
			postsPage = new PostsPage( page );
			await postsPage.visit();
			await postsPage.newPost();
		} );

		await test.step( 'When I enter post title', async () => {
			editorPage = new EditorPage( page );
			await editorPage.enterTitle( postTitle );
		} );

		await test.step( 'When I enter post content', async () => {
			const blockHandle = await editorPage!.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		await test.step( 'When I publish post', async () => {
			postURL = await editorPage!.publish();
		} );

		await test.step( 'Then I can validate the published post', async () => {
			await page.goto( postURL!.href );
			await ElementHelper.reloadAndRetry( page, async () => {
				await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
			} );
		} );

		await test.step( 'When I re-open the published post from the Posts page', async () => {
			await postsPage!.visit();
			await postsPage!.clickPost( postTitle );
			// Redefine EditorPage without target since opening from PostsPage always uses iframe.
			// See: https://github.com/Automattic/wp-calypso/issues/74925
			editorPage = new EditorPage( page );
		} );

		await test.step( 'Then the editor is shown', async () => {
			await editorPage!.waitUntilLoaded();
		} );

		await test.step( 'When I append additional content', async () => {
			const blockHandle = await editorPage!.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		await test.step( 'When I publish post again', async () => {
			postURL = await editorPage!.publish();
		} );

		await test.step( 'Then the published post contains additional content', async () => {
			await page.goto( postURL!.href );
			await ElementHelper.reloadAndRetry( page, async () => {
				await ParagraphBlock.validatePublishedContent( page, [
					originalContent,
					additionalContent,
				] );
			} );
		} );

		await test.step( 'When I re-open the post and switch to draft', async () => {
			await postsPage!.visit();
			await postsPage!.clickPost( postTitle );
			editorPage = new EditorPage( page );
			await editorPage.unpublish();
		} );

		await test.step( 'Then the post is no longer publicly visible', async () => {
			const tmpPage = await page.context().newPage();
			await tmpPage.goto( postURL!.href );
			await tmpPage.waitForSelector( 'body.error404' );
			await tmpPage.close();
		} );

		await test.step( 'When I visit the Posts page and go to Drafts', async () => {
			await postsPage!.visit();
		} );

		await test.step( 'When I trash post', async () => {
			await postsPage!.clickTab( 'Drafts' );
			await postsPage!.clickActionItemForPost( { title: postTitle, action: 'Trash' } );
		} );

		await test.step( 'Then a confirmation notice is shown for trash', async () => {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post moved to the Trash.', { type: 'Updated' } );
		} );

		await test.step( 'When I view trashed posts', async () => {
			await postsPage!.clickTab( 'Trash' );
		} );

		await test.step( 'When I hard trash post', async () => {
			await postsPage!.clickActionItemForPost( {
				title: postTitle,
				action: 'Delete Permanently',
			} );
		} );

		await test.step( 'Then a confirmation notice is shown for permanent deletion', async () => {
			const noticeComponent = new WpAdminNoticeComponent( page );
			await noticeComponent.noticeShown( '1 post permanently deleted', { type: 'Updated' } );
		} );

		void testAccount;
	} );
} );
