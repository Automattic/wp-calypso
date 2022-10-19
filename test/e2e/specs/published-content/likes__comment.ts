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

		// if ( envVariables.TEST_ON_ATOMIC ) {
		// 	const waitForLikesResponse = () =>
		// 		page.waitForResponse( /rest\/v1\/sites\/\d+\/comments\/\d+\/likes/ );

		// 	const isLikesResponseOK = async ( response: Response ) => {
		// 		const payload = await response.json();

		// 		if ( payload.code === 404 || payload.body.error === 'unknown_comment' ) {
		// 			return false;
		// 		}

		// 		return true;
		// 	};
		// 	const [ response ] = await Promise.all( [
		// 		waitForLikesResponse(),
		// 		commentsComponent.postComment( comment ),
		// 	] );

		// 	if ( ! ( await isLikesResponseOK( response ) ) ) {
		// 		const reloadUntilLikesReady = async (): Promise< void > => {
		// 			const [ response ] = await Promise.all( [ waitForLikesResponse(), page.reload() ] );
		// 			if ( ! ( await isLikesResponseOK( response ) ) ) {
		// 				return reloadUntilLikesReady();
		// 			}
		// 		};

		// 		let timeout: NodeJS.Timeout;

		// 		await Promise.race( [
		// 			reloadUntilLikesReady(),
		// 			new Promise( ( resolve, reject ) => {
		// 				timeout = setTimeout( () => {
		// 					reject( new Error( 'Likes widget could not be loaded.' ) );
		// 				}, 1000 );
		// 			} ).finally( () => {
		// 				clearTimeout( timeout );
		// 			} ),
		// 		] );
		// 	}
		// } else {
		// 	await commentsComponent.postComment( comment );
		// }

		await commentsComponent.postComment( comment );
	} );

	it( 'Like the comment', async function () {
		if ( envVariables.TEST_ON_ATOMIC ) {
			await page.reload( { waitUntil: 'networkidle' } );
		}

		await commentsComponent.like( comment );
	} );

	it( 'Unlike the comment', async function () {
		await commentsComponent.unlike( comment );
	} );
} );
