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
import InlineHelpPopoverComponent from '../lib/components/inline-help-popover-component';
import SupportSearchComponent from '../lib/components/support-search-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let supportSearchComponent;
let inlineHelpPopoverComponent;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Inline Help support search: (${ screenSize }) @parallel`, async function () {
	this.timeout( mochaTimeOut );

	step( 'Login and select a non My Home page', async function () {
		const loginFlow = new LoginFlow( driver );

		// The "inline help" FAB should not appear on the My Home
		// because there is already a support search "Card" on that
		// page. Therefore we select the "Settings" page for our tests.
		await loginFlow.loginAndSelectSettings();

		// Initialize the helper component

		inlineHelpPopoverComponent = await InlineHelpPopoverComponent.Expect( driver );
	} );

	describe( 'Popover UI visibility and interactions', function () {
		step( 'Check help toggle is visible', async function () {
			await inlineHelpPopoverComponent.isToggleVisible();
		} );

		step( 'Open Inline Help popover', async function () {
			await inlineHelpPopoverComponent.toggleOpen();

			const isPopoverVisible = await inlineHelpPopoverComponent.isPopoverVisible();
			assert.equal( isPopoverVisible, true, 'Popover was not opened correctly.' );
		} );

		step( 'Close Inline Help popover', async function () {
			await inlineHelpPopoverComponent.toggleClosed();
			const isPopoverVisible = await inlineHelpPopoverComponent.isPopoverVisible();
			assert.equal( isPopoverVisible, false, 'Popover was not closed correctly.' );
		} );
	} );

	describe( 'Performing searches', function () {
		step( 'Re-open Inline Help popover', async function () {
			await inlineHelpPopoverComponent.toggleOpen();
			supportSearchComponent = await SupportSearchComponent.Expect( driver );
		} );

		step( 'Displays contextual search results by default', async function () {
			const resultsCount = await supportSearchComponent.getSearchResultsCount();
			assert.equal( resultsCount, 5, 'There are no contextual results displayed' );
		} );

		step( 'Returns search results for valid search query', async function () {
			await supportSearchComponent.searchFor( 'Podcast' );
			const resultsCount = await supportSearchComponent.getSearchResultsCount();

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
			await supportSearchComponent.clearSearchField();

			const resultsCount = await supportSearchComponent.getSearchResultsCount();

			assert.equal( resultsCount, 5, 'There are no contextual results displayed' );
		} );

		step(
			'Shows "No results" indicator and re-displays contextual results for search queries which return no results',
			async function () {
				const invalidSearchQueryReturningNoResults = ';;;ppp;;;';

				await supportSearchComponent.searchFor( invalidSearchQueryReturningNoResults );
				const resultsCount = await supportSearchComponent.getSearchResultsCount();

				const hasNoResultsMessage = await supportSearchComponent.hasNoResultsMessage();

				assert.equal( hasNoResultsMessage, true, 'The "No results" message was not displayed.' );

				assert.equal( resultsCount, 5, 'There are no contextual results displayed.' );
			}
		);

		step( 'Does not request search results for empty search queries', async function () {
			await supportSearchComponent.clearSearchField();

			const emptyWhitespaceQuery = '         ';

			await supportSearchComponent.searchFor( emptyWhitespaceQuery );

			const searchPerformed = await supportSearchComponent.isRequestingSearchResults();

			assert.equal(
				searchPerformed,
				false,
				'A search was unexpectedly performed for an empty search query.'
			);
		} );
	} );
} );
