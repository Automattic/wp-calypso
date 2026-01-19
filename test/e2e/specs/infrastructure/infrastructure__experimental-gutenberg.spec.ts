import { EditorPage } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Gutenberg: Experimental Features', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can access experimental Gutenberg features', async ( {
		page,
		accountGivenByEnvironment,
	} ) => {
		let editorPage: EditorPage;

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async function () {
			editorPage = new EditorPage( page );
			await editorPage.visit( 'post' );
		} );

		const experimentalPackages: [ string, string, string ][] = [
			[ 'blockEditor', '__unstableInserterMenuExtension', 'function' ],
			[ 'date', '__experimentalGetSettings', 'function' ],
			[ 'components', '__experimentalNavigationBackButton', 'object' ],
			[ 'editPost', '__experimentalMainDashboardButton', 'function' ],
		];

		for ( const [ packageName, feature, featureType ] of experimentalPackages ) {
			await test.step( `Then experimental package ${ packageName } and feature ${ feature } are available`, async function () {
				const editorParent = await editorPage.getEditorParent();

				const packageAvailable = await editorParent.evaluate(
					`typeof window[ "wp" ]["${ packageName }"]`
				);

				expect( packageAvailable ).not.toStrictEqual( 'undefined' );
				expect( packageAvailable ).toStrictEqual( 'object' );

				const featureAvailable = await editorParent.evaluate(
					`typeof window[ "wp" ]["${ packageName }"]["${ feature }"]`
				);
				expect( featureAvailable ).not.toStrictEqual( 'undefined' );
				expect( featureAvailable ).toContain( featureType );
			} );
		}

		await test.step( 'And experimental data is available', async function () {
			const editorParent = await editorPage.getEditorParent();
			const blockPatterns = await editorParent.evaluate(
				"Array.isArray( window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns )"
			);
			// If this test fails, please contact #team-ganon to update premium pattern highlighting.
			expect( blockPatterns ).toStrictEqual( true );
		} );

		await test.step( 'And block pattern count is greater than default', async function () {
			// Regression test for https://github.com/Automattic/wp-calypso/pull/48940.
			// At the time I write this, the default block patterns in the test site /
			// theme used to test this (edge and non-edge) amount to 10. When activated,
			// it goes up to >100. Testing if total is > 10 would be too brittle and too
			// close to the default baseline number. 50 seems to be a good threshold.
			const expectedBlockPatternCount = 50;
			const editorParent = await editorPage.getEditorParent();
			const actualBlockPatternCount = await editorParent.evaluate(
				() =>
					/* eslint-disable @typescript-eslint/ban-ts-comment */
					new Promise( ( resolve ) => {
						let hasTimedOut = false;

						// This needs to be done in a loop until patterns request
						// returns anything as initially the data is not there yet.
						const wait = setInterval( () => {
							// @ts-ignore
							const patterns = window.wp.data.select( 'core' ).getBlockPatterns();
							if ( patterns.length > 0 || hasTimedOut ) {
								clearInterval( wait );
								resolve( patterns.length );
							}
						}, 100 );

						// Timeout after 10 seconds.
						setTimeout( () => {
							hasTimedOut = true;
						}, 10000 );
					} )
				/* eslint-enable @typescript-eslint/ban-ts-comment */
			);
			expect( actualBlockPatternCount ).toBeGreaterThanOrEqual( expectedBlockPatternCount );
		} );
	} );
} );
