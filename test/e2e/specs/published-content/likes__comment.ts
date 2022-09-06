/**
 * @group gutenberg
 */

import {
	DataHelper,
	CommentsComponent,
	EditorPage,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Likes (Comment) ' ), function () {
	const features = envToFeatureKey( envVariables );
	// @todo Does it make sense to create a `simpleSitePersonalPlanUserEdge` with GB edge?
	// for now, it will pick up the default `gutenbergAtomicSiteEdgeUser` if edge is set.
	const accountName = getTestAccountByFeature( features, [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	const comment = DataHelper.getRandomPhrase();
	let page: Page;
	let publishedURL: URL;
	let commentsComponent: CommentsComponent;
	let editorPage: EditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page, { target: features.siteType } );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		console.log( await page.context().cookies() );
	} );

	it( 'Go to the new post page', async function () {
		await editorPage.visit( 'post' );
	} );

	it( 'Enter post title', async function () {
		editorPage = new EditorPage( page, { target: features.siteType } );
		const title = DataHelper.getRandomPhrase();
		await editorPage.enterTitle( title );
	} );

	it( 'Enter post text', async function () {
		await editorPage.enterText( quote );
	} );

	it( 'Publish and visit post', async function () {
		publishedURL = await editorPage.publish( { visit: true } );
		expect( publishedURL.href ).toStrictEqual( page.url() );
	} );

	it( 'Post a comment', async function () {
		commentsComponent = new CommentsComponent( page );
		await commentsComponent.postComment( comment );
	} );

	it( 'Like the comment', async function () {
		await commentsComponent.like( comment );
	} );

	it( 'Unlike the comment', async function () {
		await commentsComponent.unlike( comment );
	} );
} );
