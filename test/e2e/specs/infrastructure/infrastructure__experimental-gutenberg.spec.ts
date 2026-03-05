import {
	DataHelper,
	EditorPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Gutenberg: Experimental Features' ),
	{ tag: [ tags.GUTENBERG ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features );

		test( 'As a user, I can access experimental Gutenberg features', async ( { page } ) => {
			let editorPage: EditorPage;

			await test.step( 'Authenticate', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorPage = new EditorPage( page );
			} );

			await test.step( 'Go to the new post page', async () => {
				const siteSlug = new TestAccount( accountName ).getSiteURL( { protocol: false } );
				await editorPage.visit( 'post', { siteSlug } );
			} );

			const experimentalPackages = [
				[ 'blockEditor', '__unstableInserterMenuExtension', 'function' ],
				[ 'date', '__experimentalGetSettings', 'function' ],
				[ 'components', '__experimentalNavigationBackButton', 'object' ],
				[ 'editPost', '__experimentalMainDashboardButton', 'function' ],
			];

			for ( const [ packageName, feature, featureType ] of experimentalPackages ) {
				await test.step( `Experimental package ${ packageName } and feature ${ feature } are available`, async () => {
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

			await test.step( 'Experimental data is available', async () => {
				const editorParent = await editorPage.getEditorParent();
				const blockPatterns = await editorParent.evaluate(
					"Array.isArray( window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns )"
				);
				// If this test fails, please contact #team-ganon to update premium pattern highlighting.
				expect( blockPatterns ).toStrictEqual( true );
			} );

			await test.step( 'Block pattern count should be greater than default', async () => {
				const expectedBlockPatternCount = 50;
				const editorParent = await editorPage.getEditorParent();
				const actualBlockPatternCount = await editorParent.evaluate(
					() =>
						/* eslint-disable @typescript-eslint/ban-ts-comment */
						new Promise( ( resolve ) => {
							let hasTimedOut = false;
							const wait = setInterval( () => {
								// @ts-ignore
								const patterns = window.wp.data.select( 'core' ).getBlockPatterns();
								if ( patterns.length > 0 || hasTimedOut ) {
									clearInterval( wait );
									resolve( patterns.length );
								}
							}, 100 );
							setTimeout( () => {
								hasTimedOut = true;
							}, 10000 );
						} )
					/* eslint-enable @typescript-eslint/ban-ts-comment */
				);
				expect( actualBlockPatternCount ).toBeGreaterThanOrEqual( expectedBlockPatternCount );
			} );
		} );
	}
);
