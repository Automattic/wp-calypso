/**
 * @group gutenberg
 */

import {
	envVariables,
	TestAccount,
	DataHelper,
	EditorPage,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Gutenberg: Experimental Features' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );

	let page: Page;
	let editorPage: EditorPage;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page, { target: features.siteType } );

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new EditorPage( page, { target: features.siteType } );
		await editorPage.visit( testAccount.getSiteURL( { protocol: true } ), 'post' );
	} );

	it.each( [
		[ 'blockEditor', '__unstableInserterMenuExtension', 'function' ],
		[ 'date', '__experimentalGetSettings', 'function' ],
		[ 'components', '__experimentalNavigationBackButton', 'object' ],
		[ 'editPost', '__experimentalMainDashboardButton', 'function' ],
	] )(
		'Experimental package %s and feature %s are available',
		async function ( packageName, feature, featureType ) {
			const editorWindowLocator = editorPage.getEditorWindowLocator();

			const packageAvailable = await editorWindowLocator.evaluate(
				`typeof window[ "wp" ]["${ packageName }"]`
			);

			expect( packageAvailable ).not.toStrictEqual( 'undefined' );
			// It should always be an object.
			expect( packageAvailable ).toStrictEqual( 'object' );

			const featureAvailable = await editorWindowLocator.evaluate(
				`typeof window[ "wp" ]["${ packageName }"]["${ feature }"]`
			);
			expect( featureAvailable ).not.toStrictEqual( 'undefined' );
			// Feature type changes between object and function and depends on the feature itself.
			expect( featureAvailable ).toContain( featureType );
		}
	);

	it( 'Experimental data is available', async function () {
		const editorWindowLocator = editorPage.getEditorWindowLocator();
		const blockPatterns = await editorWindowLocator.evaluate(
			`Array.isArray( window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns )`
		);
		// If this test fails, please contact #team-ganon to update premium pattern highlighting.
		expect( blockPatterns ).toStrictEqual( true );
	} );

	it( 'Block pattern count should be greater than default', async function () {
		// Regression test for https://github.com/Automattic/wp-calypso/pull/48940.
		// Below are notes from the original Selenium iteration of the spec.

		// At the time I write this, the default block patterns in the test site /
		// theme used to test this (edge and non-edge) amount to 10. When activated,
		// it goes up to >100. Testing if total is > 10 would be too brittle and too
		// close to the default baseline number. 50 seems to be a good threshold,
		// also to avoid potential false-negatives. I assume it's more likely that more
		// patterns will be added than removed. This also means if we see a dramatic
		// change in the number to the lower end, then something is probably wrong.
		const expectedBlockPatternCount = 50;
		const editorWindowLocator = editorPage.getEditorWindowLocator();
		const actualBlockPatternCount = await editorWindowLocator.evaluate(
			() =>
				/* eslint-disable @typescript-eslint/ban-ts-comment */
				new Promise( ( resolve ) => {
					let hasTimedOut = false;

					// This needs to be done in a loop until patterns request
					// returns anything as initially the data is not there yet,
					// and it returns an empty array, making this case a false
					// positive.
					const wait = setInterval( () => {
						// @ts-ignore
						const patterns = window.wp.data.select( 'core' ).getBlockPatterns();
						if ( patterns.length > 0 || hasTimedOut ) {
							clearInterval( wait );
							resolve( patterns.length );
						}
					}, 100 );

					// Timeout after 10 seconds. No need to wait for the full
					// jest (2 minutes) timeout.
					setTimeout( () => {
						hasTimedOut = true;
					}, 10000 );
				} )
			/* eslint-enable @typescript-eslint/ban-ts-comment */
		);
		expect( actualBlockPatternCount ).toBeGreaterThanOrEqual( expectedBlockPatternCount );
	} );
} );
