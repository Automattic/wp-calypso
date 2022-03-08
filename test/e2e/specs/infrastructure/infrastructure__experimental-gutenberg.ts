/**
 * @group gutenberg
 */

import {
	envVariables,
	TestAccount,
	DataHelper,
	GutenbergEditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Gutenberg: Experimental Features' ), function () {
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'gutenbergSimpleSiteUser';

	let page: Page;
	let editorPage: GutenbergEditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new GutenbergEditorPage( page );
		await editorPage.visit( 'post' );
	} );

	it.each( [
		[ 'blockEditor', '__unstableInserterMenuExtension', 'function' ],
		[ 'date', '__experimentalGetSettings', 'function' ],
		[ 'components', '__experimentalNavigationBackButton', 'object' ],
		[ 'editPost', '__experimentalMainDashboardButton', 'function' ],
	] )(
		'Experimental package %s and feature %s are available',
		async function ( packageName, feature, featureType ) {
			const frame = await editorPage.getEditorFrame();
			const packageAvailable = await frame.evaluate( `typeof window[ "wp" ]["${ packageName }"]` );

			expect( packageAvailable ).not.toStrictEqual( 'undefined' );
			// It should always be an object.
			expect( packageAvailable ).toStrictEqual( 'object' );

			const featureAvailable = await frame.evaluate(
				`typeof window[ "wp" ]["${ packageName }"]["${ feature }"]`
			);
			expect( featureAvailable ).not.toStrictEqual( 'undefined' );
			// Feature type changes between object and function and depends on the feature itself.
			expect( featureAvailable ).toContain( featureType );
		}
	);

	it( 'Experimental data is available', async function () {
		const frame = await editorPage.getEditorFrame();
		const blockPatterns = await frame.evaluate(
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
		const frame = await editorPage.getEditorFrame();
		const actualBlockPatternCount = await frame.evaluate(
			`window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns.length`
		);

		expect( actualBlockPatternCount ).toBeGreaterThanOrEqual( expectedBlockPatternCount );
	} );
} );
