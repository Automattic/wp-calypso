/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	EditorPage,
	envVariables,
	TestAccount,
	PostsPage,
	getTestAccountByFeature,
	envToFeatureKey,
	hardCodeAtomicEditorRouting,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Advanced Post Flow` ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{ gutenberg: 'edge', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
	] );

	let page: Page;
	let editorPage: EditorPage;
	let postsPage: PostsPage;

	beforeAll( async function () {
		page = await browser.newPage();
		await hardCodeAtomicEditorRouting( page );
		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	describe( 'Start post', function () {
		it( 'Visit /posts page', async function () {
			postsPage = new PostsPage( page );
			await postsPage.visit();
		} );

		it( 'Start new post', async function () {
			await postsPage.newPost();
		} );

		it( 'Go back', async function () {
			editorPage = new EditorPage( page, { target: 'atomic' } );
			await editorPage.exitEditor();
			await page.pause();
		} );
	} );
} );
