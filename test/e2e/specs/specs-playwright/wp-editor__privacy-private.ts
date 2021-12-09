/**
 * @group gutenberg
 */

import {
	DataHelper,
	TestAccount,
	GutenbergEditorPage,
	setupHooks,
	EditorSettingsSidebarComponent,
	PostVisibilityOptions,
	PublishedPostPage,
	BrowserHelper,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Editor: Post Privacy` ), function () {
	const accountName = BrowserHelper.targetGutenbergEdge()
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	const content = DataHelper.getRandomPhrase();
	const visibility = 'Private';

	let page: Page;
	let url: string;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

	setupHooks( async ( args ) => {
		page = args.page;
	} );

	describe( `Create a ${ visibility } post`, function () {
		beforeAll( async function () {
			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Go to the new post page', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.visit( 'post' );
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.enterTitle(
				`Post Visibility: ${ visibility } - ${ DataHelper.getTimestamp() }`
			);
		} );

		it( 'Enter post content', async function () {
			await gutenbergEditorPage.enterText( content );
		} );

		it( `Set post visibility to ${ visibility }`, async function () {
			const frame = await gutenbergEditorPage.getEditorFrame();
			editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
			await editorSettingsSidebarComponent.clickTab( 'Post' );
			await editorSettingsSidebarComponent.setVisibility( visibility as PostVisibilityOptions );
			url = await gutenbergEditorPage.getPublishedURL();
		} );
	} );

	describe( `View post as ${ accountName }`, function () {
		it( `Post content is visible as ${ accountName }`, async function () {
			await page.goto( url );
			const publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.validateTextInPost( content );
		} );
	} );

	describe.each( [ 'defaultUser', 'public' ] )( 'View post as %s', function ( user ) {
		beforeAll( async function () {
			// Clear logged in state to simulate the post being viewed by the public.
			if ( user === 'public' ) {
				const context = page.context();
				await context.clearCookies();
				await page.evaluate( 'localStorage.clear();' );
			} else {
				const testAccount = new TestAccount( user );
				await testAccount.authenticate( page );
			}
		} );

		it( 'Post content is not visible', async function () {
			await page.goto( url );
			const publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.validateTextInPost( 'Nothing here' );
		} );
	} );
} );
