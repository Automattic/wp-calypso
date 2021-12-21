/**
 * @group gutenberg
 */

import {
	DataHelper,
	LoginPage,
	NewPostFlow,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	RevisionsComponent,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Editor: Revisions` ), function () {
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'simpleSitePersonalPlanUser' } );
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
	} );

	it( 'Enter post title', async function () {
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	it.each( [ { revision: 1 }, { revision: 2 } ] )(
		'Create revision %i',
		async function ( { revision } ) {
			await gutenbergEditorPage.enterText( `Revision ${ revision }` );
			await gutenbergEditorPage.saveDraft();
		}
	);

	it( 'View revisions', async function () {
		const frame = await gutenbergEditorPage.getEditorFrame();
		await gutenbergEditorPage.openSettings();
		editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
		await editorSettingsSidebarComponent.clickTab( 'Post' );
		await editorSettingsSidebarComponent.showRevisions();
	} );

	it( 'Restore first revision', async function () {
		const revisionsComponent = new RevisionsComponent( page );
		await revisionsComponent.selectRevision( 1 );
		await revisionsComponent.clickButton( 'Load' );
		const text = await gutenbergEditorPage.getText();
		expect( text ).toEqual( '' );
	} );
} );
