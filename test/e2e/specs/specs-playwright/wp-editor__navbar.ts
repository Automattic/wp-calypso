/**
 * @group gutenberg
 */

import {
	DataHelper,
	LoginPage,
	NewPostFlow,
	GutenbergEditorPage,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Editor: Navbar` ), function () {
	let page: Page;
	const mainUser = 'gutenbergSimpleSiteUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: mainUser } );
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
	} );

	it( 'Return to Home dashboard', async function () {
		const gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.openNavSidebar();
		await gutenbergEditorPage.returnToHomeDashboard();
	} );
} );
