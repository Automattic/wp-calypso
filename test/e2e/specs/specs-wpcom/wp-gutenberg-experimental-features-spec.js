import assert from 'assert';
import config from 'config';
import * as dataHelper from '../../lib/data-helper';
import * as driverManager from '../../lib/driver-manager';
import LoginFlow from '../../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

// Experimental Gutenberg features that we depend on in Calypso (and other projects)
// Tests will fail if an experimental feature is no longer being exported from one
// of the @wordpress/* packages. The purpose of these tests is to give us an early
// warning if an experimental feature has been removed or renamed.
const EXPERIMENTAL_FEATURES = {
	'@wordpress/block-editor': [ '__unstableInserterMenuExtension' ],
	'@wordpress/date': [ '__experimentalGetSettings' ],
	'@wordpress/components': [ '__experimentalNavigationBackButton' ],
	'@wordpress/edit-post': [ '__experimentalMainDashboardButton' ],
};

/**
 * Given a string, returns a new string with dash separators converted to
 * camelCase equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will also capitalize letters
 * following numbers.
 *
 * @param {string} string Input dash-delimited string.
 * @returns {string} Camel-cased string.
 */
function camelCaseDash( string ) {
	return string.replace( /-([a-z])/g, ( _, letter ) => letter.toUpperCase() );
}

describe( `[${ host }] Experimental features we depend on are available (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can log in', async function () {
		this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
		return await this.loginFlow.loginAndStartNewPost( null, true );
	} );

	describe( 'Can find experimental package features', function () {
		for ( const [ packageName, features ] of Object.entries( EXPERIMENTAL_FEATURES ) ) {
			// Removes the `@wordpress/` prefix and hyphens from package name
			// The algorithm WP uses to convert package names to variable names is here: https://github.com/WordPress/gutenberg/blob/a03ea51e11a36d0abeecb4ce4e4cea5ffebdffc5/packages/dependency-extraction-webpack-plugin/lib/util.js#L40-L45
			const wpGlobalName = camelCaseDash( packageName.substr( '@wordpress/'.length ) );

			it( `"${ wpGlobalName }" package should be available in the global window object`, async function () {
				const typeofPackage = await this.driver.executeScript(
					`return typeof window.wp['${ wpGlobalName }']`
				);
				assert.notStrictEqual(
					typeofPackage,
					'undefined',
					`${ wpGlobalName } is ${ typeofPackage }`
				);
			} );

			for ( const feature of features ) {
				it( `${ feature } should be available in ${ packageName }`, async function () {
					const typeofExperimentalFeature = await this.driver.executeScript(
						`return typeof window.wp['${ wpGlobalName }']['${ feature }']`
					);
					assert.notStrictEqual(
						typeofExperimentalFeature,
						'undefined',
						`${ feature } is undefined`
					);
				} );
			}
		}
	} );

	describe( 'Experimental data we depend on is available', function () {
		it( `is iterable: wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns`, async function () {
			const __experimentalBlockPatternsAreIterable = await this.driver.executeScript(
				`return Array.isArray( window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns )`
			);
			assert(
				__experimentalBlockPatternsAreIterable,
				'__experimentalBlockPatterns was not iterable, please contact #team-ganon to update premium pattern highlighting'
			);
		} );

		// Regression test for https://github.com/Automattic/wp-calypso/pull/48940.
		// At the time I write this, the default block patterns in the test site /
		// theme used to test this (edge and non-edge) amount to 10. When activated,
		// it goes up to >100. Testing if total is > 10 would be too brittle and too
		// close to the default baseline number. 50 seems to be a good threshold,
		// also to avoid potential false-negatives. I assume it's more likely that more
		// patterns will be added than removed. This also means if we see a dramatic
		// change in the number to the lower end, then something is probably wrong.
		it( `number of block patterns loaded should be greater than the default`, async function () {
			const expectedExperimentalBlockPatternsLength = 50;
			const __experimentalBlockPatternsLength = await this.driver.executeScript(
				`return window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns.length`
			);
			assert(
				__experimentalBlockPatternsLength >= expectedExperimentalBlockPatternsLength,
				`Number of loaded block patterns does not seem right (expected: >= ${ expectedExperimentalBlockPatternsLength }, actual: ${ __experimentalBlockPatternsLength })`
			);
		} );
	} );

	after( async () => {
		return await this.driver.switchTo().defaultContent();
	} );
} );
