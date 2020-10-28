/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

// Experimental Gutenberg features that we depend on in Calypso (and other projects)
// Tests will fail if an experimental feature is no longer being exported from one
// of the @wordpress/* packages. The purpose of these tests is to give us an early
// warning if an experimental feature has been removed or renamed.
const EXPERIMENTAL_FEATURES = {
	'@wordpress/block-editor': [
		// Used in the premium content block in the Editing Toolkit plugin
		'__experimentalAlignmentHookSettingsProvider',
		'__experimentalBlock',
	],
};

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Experimental features we depend on are available (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	step( 'Can log in', async function () {
		this.loginFlow = new LoginFlow( driver, gutenbergUser );
		return await this.loginFlow.loginAndStartNewPost( null, true );
	} );

	for ( const [ packageName, features ] of Object.entries( EXPERIMENTAL_FEATURES ) ) {
		// Remove the `@wordpress/` prefix and hyphens from package name
		const wpGlobalName = _.camelCase( packageName.substr( '@wordpress/'.length ) );

		describe( packageName, () => {
			for ( const feature of features ) {
				step( `${ feature } should be available in ${ packageName }`, async () => {
					const typeofExperimentalFeature = await driver.executeScript(
						`typeof window.wp['${ wpGlobalName }']['${ feature }']`
					);
					assert.notStrictEqual(
						typeofExperimentalFeature,
						'undefined',
						`${ feature } is undefined`
					);
				} );
			}
		} );
	}

	after( async () => {
		return await driver.switchTo().defaultContent();
	} );
} );
