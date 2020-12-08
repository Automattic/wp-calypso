/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

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

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Experimental data we depend on is available (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	step( 'Can log in', async function () {
		this.loginFlow = new LoginFlow( driver, gutenbergUser );
		return await this.loginFlow.loginAndStartNewPost( null, true );
	} );

	step(
		`is iterable: wp.data.select( 'core/editor' ).getEditorSettings().__missingExperimentalBlockPatterns exists`,
		async function () {
			const __missingExperimentalBlockPatternsArePresent = await driver.executeScript(
				`return Array.isArray( window.wp.data.select( 'core/editor' ).getEditorSettings().___missingExperimentalBlockPatterns )`
			);
			assert(
				__missingExperimentalBlockPatternsArePresent,
				'___missingExperimentalBlockPatterns was not iterable, please contact #team-ganon to update premium pattern highlighting'
			);
		}
	);

	step(
		`is iterable: wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns`,
		async function () {
			const __experimentalBlockPatternsArePresent = await driver.executeScript(
				`return Array.isArray( window.wp.data.select( 'core/editor' ).getEditorSettings().__experimentalBlockPatterns )`
			);
			assert(
				__experimentalBlockPatternsArePresent,
				'__experimentalBlockPatterns was not iterable, please contact #team-ganon to update premium pattern highlighting'
			);
		}
	);

	after( async () => {
		return await driver.switchTo().defaultContent();
	} );
} );
