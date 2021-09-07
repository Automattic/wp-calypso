import {
	GutenbergEditorPage,
	DataHelper,
	LoginFlow,
	setupHooks,
	NewPostFlow,
	InstagramBlock,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'WPCOM-specific gutter controls' ), () => {
	let gutenbergEditorPage: GutenbergEditorPage;
	let instagramBlock: InstagramBlock;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Insert Instagram block', async function () {
		instagramBlock = new InstagramBlock( page, {
			embedUrl: 'https://www.instagram.com/p/BlDOZMil933/',
			expectedPostText: 'woocommerce',
		} );

		await gutenbergEditorPage.addBlock( instagramBlock.blockName );
		await instagramBlock.configure();
	} );
} );
