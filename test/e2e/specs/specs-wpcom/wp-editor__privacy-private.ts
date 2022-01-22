/**
 * @group gutenberg
 */

import {
	DataHelper,
	TestAccount,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	PrivacyOptions,
	PublishedPostPage,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Privacy` ), function () {
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	const content = DataHelper.getRandomPhrase();
	const visibility = 'Private';

	let page: Page;
	let url: string;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

	describe( `Create a ${ visibility } post`, function () {
		beforeAll( async function () {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Go to the new post page', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.visit( 'page' );
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.enterTitle(
				`Privacy: ${ visibility } - ${ DataHelper.getTimestamp() }`
			);
		} );

		it( 'Enter post content', async function () {
			await gutenbergEditorPage.enterText( content );
		} );

		it( `Set post visibility to ${ visibility }`, async function () {
			const frame = await gutenbergEditorPage.getEditorFrame();
			editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
			await editorSettingsSidebarComponent.clickTab( 'Page' );
			await editorSettingsSidebarComponent.setVisibility( visibility as PrivacyOptions );
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
		let testPage: Page;

		beforeAll( async function () {
			testPage = await browser.newPage();

			if ( user !== 'public' ) {
				const testAccount = new TestAccount( user );
				await testAccount.authenticate( page );
			}
		} );

		it( `Post content is not visible as ${ user }`, async function () {
			await testPage.goto( url );
			const publishedPostPage = new PublishedPostPage( testPage );
			await publishedPostPage.validateTextInPost( 'Nothing here' );
		} );
	} );
} );
