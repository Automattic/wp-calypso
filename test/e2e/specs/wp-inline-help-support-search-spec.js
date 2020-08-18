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
import SidebarComponent from '../lib/components/sidebar-component';

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

describe( `[${ host }] Inline Help: (${ screenSize }) @parallel`, async function () {
	this.timeout( mochaTimeOut );

	step( 'Login and select a non My Home page', async function () {
		const loginFlow = new LoginFlow( driver );

		await loginFlow.loginAndSelectMySite();

		// Initialize the helper component
		inlineHelpPopoverComponent = await InlineHelpPopoverComponent.Expect( driver );
	} );

	describe( 'Popover UI visibility', function () {
		step( 'Check help toggle is not visible on My Home page', async function () {
			// The toggle only hides once the "Get help" card is rendered so
			// we need to give it a little time to be removed.
			await inlineHelpPopoverComponent.waitForToggleNotToBePresent();

			// Once removed we can assert is is invisible.
			const isToggleVisible = await inlineHelpPopoverComponent.isToggleVisible();
			assert.equal(
				isToggleVisible,
				false,
				'Inline Help support search was not correctly hidden on Home page.'
			);
		} );

		step( 'Switch to non My Home page', async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );

			// The "inline help" FAB should not appear on the My Home
			// because there is already a support search "Card" on that
			// page. Therefore we select the "Themes" page for our tests
			// and then we will switch away to the Homepage to verify
			// that the Inline Help is not shown
			await sidebarComponent.selectThemes();
		} );

		step( 'Check help toggle is visible on non My Home page', async function () {
			await inlineHelpPopoverComponent.isToggleVisible();
		} );
	} );

	describe( 'Performing searches', function () {
		step( 'Open Inline Help popover', async function () {
			await inlineHelpPopoverComponent.toggleOpen();
			supportSearchComponent = await SupportSearchComponent.Expect( driver );
		} );

		step( 'Displays contextual search results by default', async function () {
			const resultsCount = await supportSearchComponent.getDefaultResultsCount();
			assert.equal( resultsCount, 5, 'There are no contextual results displayed' );
		} );

		step( 'Returns search results for valid search query', async function () {
			await supportSearchComponent.searchFor( 'Podcast' );
			const resultsCount = await supportSearchComponent.getSearchResultsCount();

			assert.equal(
				resultsCount <= 5,
				true,
				`Too many search results displayed. Should be less than or equal to 5.`
			);
			assert.equal(
				resultsCount >= 1,
				true,
				`Too few search results displayed. Should be more than or equal to 1.`
			);
		} );

		step( 'Resets search UI to default state when search input is cleared ', async function () {
			await supportSearchComponent.clearSearchField();

			const resultsCount = await supportSearchComponent.getDefaultResultsCount();

			assert.equal( resultsCount, 5, 'There are no contextual results displayed' );
		} );

		step(
			'Shows "No results" indicator and re-displays contextual results for search queries which return no results',
			async function () {
				const invalidSearchQueryReturningNoResults = ';;;ppp;;;';

				await supportSearchComponent.searchFor( invalidSearchQueryReturningNoResults );
				const resultsCount = await supportSearchComponent.getDefaultResultsCount();

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

		step( 'Close Inline Help popover', async function () {
			await inlineHelpPopoverComponent.toggleClosed();
			const isPopoverVisible = await inlineHelpPopoverComponent.isPopoverVisible();
			assert.equal( isPopoverVisible, false, 'Popover was not closed correctly.' );
		} );
	} );
} );
