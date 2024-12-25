import { readFileSync } from 'fs';
import path from 'path';
import {
	DataHelper,
	envVariables,
	EditorPage,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	PostsPage,
	Metrics,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;
const results: Record< string, number[] > = {};

describe( DataHelper.createSuiteTitle( 'Metrics: Editor' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature(
		features,
		// The default accounts for gutenberg+simple are `gutenbergSimpleSiteEdgeUser` for GB edge
		// and `gutenbergSimpleSiteUser` for stable. The criteria below conflicts with the default
		// one that would return the `gutenbergSimpleSiteUser`. We also can't define it as part of
		// the default criteria, and should pass it here, as an override. For this specific function
		// call, `simpleSitePersonalPlanUser` will be retured when gutenberg is stable, and siteType
		// is simple.
		[ { gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' } ]
	);

	let page: Page;
	let editorPage: EditorPage;
	let postsPage: PostsPage;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Start and fill a test post', async function () {
		postsPage = new PostsPage( page );
		const metrics = new Metrics( page );
		await postsPage.visit();
		await postsPage.newPost();
		editorPage = new EditorPage( page );
		await editorPage.waitUntilLoaded();
		const filePath = path.join( __dirname, './fixtures/large-post.html' );
		await editorPage.loadHtmlContent( readFileSync( filePath, 'utf8' ).trim() );
		const canvas = await editorPage.getEditorCanvas();
		await canvas.locator( '.wp-block' ).first().waitFor();
		await editorPage.enterTitle( 'Test Post' );
		await editorPage.publish();

		const samples = 2;
		const throwaway = 1;
		const iterations = samples + throwaway;

		for ( let i = 1; i <= iterations; i++ ) {
			await page.reload();
			editorPage = new EditorPage( page );
			editorPage.waitUntilLoaded();
			const canvas = await editorPage.getEditorCanvas();
			// Wait for the first block.
			await canvas.locator( '.wp-block' ).first().waitFor();
			// Get the durations.
			const loadingDurations = await metrics.getLoadingDurations();

			// Save the results.
			if ( i > throwaway ) {
				Object.entries( loadingDurations ).forEach( ( [ metric, duration ] ) => {
					const metricKey = metric === 'timeSinceResponseEnd' ? 'firstBlock' : metric;
					if ( ! results[ metricKey ] ) {
						results[ metricKey ] = [];
					}
					results[ metricKey ].push( duration );
				} );
			}
		}

		console.log( results );
	} );
} );
