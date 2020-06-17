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
let inlineHelpComponent;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Accessing support search: (${ screenSize })`, async function () {
	this.timeout( mochaTimeOut );

	describe( 'Inline Help FAB popover', function () {
		step( 'Login and select a non My Home page', async function () {
			const loginFlow = new LoginFlow( driver );

			// The "inline help" FAB sholuld not appear on the My Home
			// because there is already a support search "Card" on that
			// page. Therefore we select the "Themes" page for our tests.
			await loginFlow.loginAndSelectThemes();

			// Initialize the helper component
			inlineHelpComponent = await InlineHelpComponent.Expect( driver );
		} );

		describe( 'Popover UI visibility and interactions', function () {
			step( 'Check help toggle is visible', async function () {
				await inlineHelpComponent.isToggleVisible();
			} );

			step( 'Open Inline Help popover', async function () {
				await inlineHelpComponent.toggleOpen();
				return await inlineHelpComponent.isPopoverVisible();
			} );

			step( 'Close Inline Help popover', async function () {
				await inlineHelpComponent.toggleClosed();
				const isPopoverVisible = await inlineHelpComponent.isPopoverVisible();
				assert.equal( isPopoverVisible, false, 'Popover was not closed correctly.' );
			} );
		} );

		describe( 'Performing searches', function () {
			step( 'Re-open Inline Help popover', async function () {
				await inlineHelpComponent.toggleOpen();
			} );

			step( 'Displays contextual search results by default', async function () {
				const resultsCount = await inlineHelpComponent.getSearchResultsCount();
				assert.equal( resultsCount, 5, 'There are no contextual results displayed' );
			} );

			step( 'Returns search results for valid search query', async function () {
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
				await inlineHelpComponent.clearSearchField();

				// Once https://github.com/Automattic/wp-calypso/pull/43323 is merged this will work again
				// const results = await inlineHelpComponent.getSearchResults();
				// assert.strictEqual( results.length, 5, 'There are no contextual results displayed' );
			} );

			step(
				'Shows "No results" indicator and re-displays contextual results for search queries which return no results',
				async function () {
					const invalidSearchQueryReturningNoResults = ';;;ppp;;;';

					await inlineHelpComponent.searchFor( invalidSearchQueryReturningNoResults );
					const resultsCount = await inlineHelpComponent.getSearchResultsCount();

					const hasNoResultsMessage = await inlineHelpComponent.hasNoResultsMessage();

					assert.equal( hasNoResultsMessage, true, 'The "No results" message was not displayed.' );

					assert.equal( resultsCount, 5, 'There are no contextual results displayed.' );
				}
			);

			step( 'Does not request search results for empty search queries', async function () {
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
} );
