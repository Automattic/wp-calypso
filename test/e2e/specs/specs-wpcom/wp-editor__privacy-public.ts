/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	PrivacyOptions,
	TestAccount,
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
	const visibility = 'Public';

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
			await gutenbergEditorPage.selectPageDesign( 'blank' );
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
		} );

		it( 'Publish post', async function () {
			url = await gutenbergEditorPage.publish();
		} );
	} );

	describe.each( [ accountName, 'defaultUser', 'public' ] )( 'View post as %s', function ( user ) {
		let testPage: Page;

		beforeAll( async function () {
			testPage = await browser.newPage();

			if ( user !== 'public' ) {
				const testAccount = new TestAccount( user );
				await testAccount.authenticate( page );
			}
		} );

		it( `Post content is visible as ${ user }`, async function () {
			await testPage.goto( url );
			const publishedPostPage = new PublishedPostPage( testPage );
			await publishedPostPage.validateTextInPost( content );
		} );
	} );
} );
