/**
 * @group gutenberg
 */

import {
	DataHelper,
	LoginPage,
	NewPostFlow,
	GutenbergEditorPage,
	setupHooks,
	EditorSettingsSidebarComponent,
	VisibilityOptions,
	PublishedPostPage,
	BrowserHelper,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const user = BrowserHelper.targetGutenbergEdge()
	? 'gutenbergSimpleSiteEdgeUser'
	: 'simpleSitePersonalPlanUser';

describe( DataHelper.createSuiteTitle( `Editor: Post Privacy` ), function () {
	const content = DataHelper.getRandomPhrase();
	const visibility = 'Public';

	let page: Page;
	let url: string;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( `Create a ${ visibility } post`, function () {
		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
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
			await editorSettingsSidebarComponent.setVisibility( visibility as VisibilityOptions );
		} );

		it( 'Publish post', async function () {
			url = await gutenbergEditorPage.publish();
		} );
	} );

	describe.each( [ user, 'defaultUser' ] )( 'View post as %s', function ( user ) {
		it( `Log in as ${ user }`, async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
		} );

		it( 'Contents are visible', async function () {
			await page.goto( url );
			const publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.validateTextInPost( content );
		} );
	} );

	describe( 'View post publicly', function () {
		it( 'Clear cookies', async function () {
			const context = page.context();
			await context.clearCookies();
		} );

		it( 'Contents are visible', async function () {
			await page.goto( url );
			const publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.validateTextInPost( content );
		} );
	} );
} );
