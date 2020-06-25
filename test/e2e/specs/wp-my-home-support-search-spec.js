/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as driverHelper from '../lib/driver-helper.js';

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

const helpCardSelector = By.css( '.help-search' );

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] My Home "Get help" support search card: (${ screenSize }) @parallel`, async function () {
	this.timeout( mochaTimeOut );

	step( 'Login and select a non My Home page', async function () {
		const loginFlow = new LoginFlow( driver );

		// The "inline help" FAB should not appear on the My Home
		// because there is already a support search "Card" on that
		// page. Therefore we select the "Themes" page for our tests
		// and then we will switch away to the Homepage to verify
		// that the Inline Help is not shown
		await loginFlow.loginAndSelectThemes();

		// Initialize the helper component for the Inline Popover
		inlineHelpPopoverComponent = await InlineHelpPopoverComponent.Expect( driver );

		// Check the InlineHelp toggle is actually visible in the first instance...
		const isToggleVisible = await inlineHelpPopoverComponent.isToggleVisible();
		assert.equal(
			isToggleVisible,
			true,
			'Inline Help support search was not displayed on a non My Home page.'
		);
	} );

	step( 'Select the My Home page', async function () {
		const sidebarComponent = await SidebarComponent.Expect( driver );
		await sidebarComponent.selectMyHome();
	} );

	step( 'Verify "Get help" support card is displayed', async function () {
		// Card can take a little while to display, so let's wait...
		await driverHelper.waitTillPresentAndDisplayed( driver, helpCardSelector );

		// For safety also scroll into viewport - also helps when visually verify test runs.
		await driverHelper.scrollIntoView( driver, helpCardSelector );

		// Verify it is there.
		const isGetHelpCardPresent = await driverHelper.isElementPresent( driver, helpCardSelector );
		assert.equal(
			isGetHelpCardPresent,
			true,
			'"Get help" card was not displayed on the My Home page.'
		);
	} );

	step( 'Verify Inline Help support search is not displayed on My Home', async function () {
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

	step( 'Displays contextual search results by default', async function () {
		supportSearchComponent = await SupportSearchComponent.Expect( driver );
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
