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
			const resultsCount = await inlineHelpComponent.getSearchResultsCount();
			assert.equal( resultsCount, 5, 'There are no contextual results displayed' );
		} );

		step( 'Returns search results for valid search query', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			await inlineHelpComponent.searchFor( 'Podcast' );
			const resultsCount = await inlineHelpComponent.getSearchResultsCount();

			assert.equal(
				resultsCount <= 5,
				true,
				`Too many search results displayed. Should be less than or equal to 5 (was ${ resultsCount }).`
			);
			assert.equal(
				resultsCount >= 1,
				true,
				`Too few search results displayed. Should be more than or equal to 1 (was ${ resultsCount }).`
			);
		} );

		step( 'Resets search UI to default state when search input is cleared ', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			await inlineHelpComponent.clearSearchField();

			// Once https://github.com/Automattic/wp-calypso/pull/43323 is merged this will work again
			// const results = await inlineHelpComponent.getSearchResults();
			// assert.strictEqual( results.length, 5, 'There are no contextual results displayed' );
		} );

		step(
			'Shows "No results" indicator and re-displays contextual results for search queries which return no results',
			async function () {
				const invalidSearchQueryReturningNoResults = ';;;ppp;;;';
				const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
				await inlineHelpComponent.searchFor( invalidSearchQueryReturningNoResults );
				const resultsCount = await inlineHelpComponent.getSearchResultsCount();

				const hasNoResultsMessage = await inlineHelpComponent.hasNoResultsMessage();

				assert.equal( hasNoResultsMessage, true, 'The "No results" message was not displayed.' );

				assert.equal( resultsCount, 5, 'There are no contextual results displayed.' );
			}
		);

		step( 'Does not request search results for empty search queries', async function () {
			const inlineHelpComponent = await InlineHelpComponent.Expect( driver );
			await inlineHelpComponent.clearSearchField();

			const emptyWhitespaceQuery = '         ';

			await inlineHelpComponent.searchFor( emptyWhitespaceQuery );

			const searchPerformed = await inlineHelpComponent.isRequestingSearchResults();

			assert.equal(
				searchPerformed,
				false,
				'A search was unexpectedly performed for an empty search query.'
			);
		} );
	} );
} );
