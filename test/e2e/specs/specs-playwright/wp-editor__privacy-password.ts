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
	const visibility = 'Password';
	const postPassword = 'car';

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
			await editorSettingsSidebarComponent.setPostPassword( postPassword );
		} );

		it( 'Publish post', async function () {
			url = await gutenbergEditorPage.publish();
		} );
	} );

	describe.each( [ user, 'defaultUser', 'public' ] )( 'View post as %s', function ( user ) {
		it( `Switch to ${ user }`, async function () {
			const context = page.context();
			await context.clearCookies();
			await page.evaluate( 'localStorage.clear();' );

			if ( user !== 'public' ) {
				const loginPage = new LoginPage( page );
				await loginPage.login( { account: user } );
			}
		} );

		it( 'Contents are visible after entering password', async function () {
			await page.goto( url );
			const publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.enterPostPassword( postPassword );
			await publishedPostPage.validateTextInPost( content );
		} );
	} );
} );
