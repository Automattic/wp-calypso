/**
 * @group gutenberg
 */

import {
	DataHelper,
	ElementHelper,
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
	let commentsComponent: CommentsComponent;
	let editorPage: EditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page, { target: features.siteType } );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
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
		await editorPage.publish( { visit: true } );
	} );

	it( 'Post a comment', async function () {
		commentsComponent = new CommentsComponent( page );
		// Same as the Like button below, the comment box is sometimes not
		// available initially. Let's retry if that happens.
		await ElementHelper.reloadAndRetry( page, () => commentsComponent.postComment( comment ) );
	} );

	it( 'Like the comment', async function () {
		// Sometimes, in the Atomic env, the Likes widget is not immediately
		// loaded and gets stuck in the "Loading…" state. The reason for that is
		// that the API likes request for the created comment returns an
		// "unknown_comment" error. This is most likely because it doesn't catch
		// up with the automation speed, so we reload the page to fetch the
		// likes status again.
		await ElementHelper.reloadAndRetry( page, () => commentsComponent.like( comment ) );
	} );

	it( 'Unlike the comment', async function () {
		await ElementHelper.reloadAndRetry( page, () => commentsComponent.unlike( comment ) );
	} );
} );
