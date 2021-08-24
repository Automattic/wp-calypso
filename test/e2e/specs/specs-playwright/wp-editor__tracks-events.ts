import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page, Frame } from 'playwright';

describe( DataHelper.createSuiteTitle( `Tracks Events for Post Editor` ), function () {
	let page: Page;
	const mainUser = 'gutenbergSimpleSiteUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, mainUser );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
	} );

	it( 'Enter post title', async function () {
		const gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	it( 'Tracks "wpcom_block_editor_post_publish_add_new_click" event', async function () {
		const gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.publish();
		// Get the frame before creating the new post because we won't be able to access it once navigation starts
		const frame = await gutenbergEditorPage.waitUntilLoaded();
		await gutenbergEditorPage.postPublishAddNewItem( { noWaitAfter: true } );

		expect( await getLatestEvent( frame ) ).toMatchObject( [
			'wpcom_block_editor_post_publish_add_new_click',
			expect.objectContaining( {
				_en: 'wpcom_block_editor_post_publish_add_new_click',
				editor_type: 'post',
				post_type: 'post',
			} ),
		] );
	} );
} );

async function getLatestEvent( frame: Frame ) {
	const stack = await getEventsStack( frame );
	return stack.length ? stack[ 0 ] : undefined;
}

async function getEventsStack( frame: Frame ) {
	return await frame.evaluate( () => {
		return ( window as any )._e2eEventsStack;
	} );
}
