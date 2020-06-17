/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';
import * as dataHelper from '../lib/data-helper';
import InlineHelpComponent from '../lib/components/inline-help-component';
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Accessing support search: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Inline Help FAB popover', function () {
		step( 'Login and select a non My Home page', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndSelectThemes();
		} );
		step( 'Check help toggle is visible', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			await inlineHelpComponent.isToggleVisible();
		} );

		step( 'Open Inline Help popover', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			await inlineHelpComponent.toggleOpen();
		} );

		step( 'Displays contextual search results by default', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			const results = await inlineHelpComponent.getSearchResults();
			assert.strictEqual( results.length, 5, 'There are no contextual results displayed' );
		} );

		step( 'Returns search results for valid search query', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			await inlineHelpComponent.searchFor( 'Podcast' );
			const results = await inlineHelpComponent.getSearchResults();
			const resultsLength = results.length;

			assert.equal(
				resultsLength <= 5,
				true,
				`Too many search results displayed. Should be less than or equal to 5 (was ${ resultsLength }).`
			);
			assert.equal(
				resultsLength >= 1,
				true,
				`Too few search results displayed. Should be more than or equal to 1 (was ${ resultsLength }).`
			);
		} );
	} );
} );
