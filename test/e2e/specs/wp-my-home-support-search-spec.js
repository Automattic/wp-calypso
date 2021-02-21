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
import SupportSearchComponent from '../lib/components/support-search-component';
import SidebarComponent from '../lib/components/sidebar-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let supportSearchComponent;

const helpCardSelector = By.css( '.help-search' );

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] My Home "Get help" support search card: (${ screenSize }) @parallel`, async function () {
	this.timeout( mochaTimeOut );

	step( 'Login and select the My Home page', async function () {
		const loginFlow = new LoginFlow( driver );

		await loginFlow.loginAndSelectMySite();

		// The "/home" route is the only one this support search
		// "Card" will show on
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

	step( 'Displays Default Results initially', async function () {
		supportSearchComponent = await SupportSearchComponent.Expect( driver );
		const resultsCount = await supportSearchComponent.getDefaultResultsCount();
		assert.equal( resultsCount, 6, 'There are not 6 Default Results displayed.' );
	} );

	step( 'Returns API Search Results for valid search query', async function () {
		await supportSearchComponent.searchFor( 'Domain' );

		const searchResultsCount = await supportSearchComponent.getSearchResultsCount();

		const adminResultsCount = await supportSearchComponent.getAdminSearchResultsCount();

		const defaultResults = await supportSearchComponent.waitForDefaultResultsNotToBePresent();

		assert.equal(
			defaultResults,
			true,
			'The Default Results are displayed. They should not be present after we have API Search Results.'
		);

		assert.equal(
			searchResultsCount <= 5,
			true,
			`Too many API Search Results displayed. Should be less than or equal to 5.`
		);
		assert.equal(
			searchResultsCount >= 1,
			true,
			`Too few API Search Results displayed. Should be more than or equal to 1.`
		);
		assert.equal(
			adminResultsCount <= 3,
			true,
			`Too many Admin Results displayed. Should be less than or equal to 3.`
		);
		assert.equal(
			adminResultsCount >= 1,
			true,
			`Too few Admin Results displayed. Should be more than or equal to 1.`
		);
	} );

	step( 'Resets search UI to default state when search input is cleared', async function () {
		await supportSearchComponent.clearSearchField();

		const searchResults = await supportSearchComponent.waitForSearchResultsNotToBePresent();

		const adminResults = await supportSearchComponent.waitForAdminResultsNotToBePresent();

		const defaultResultsCount = await supportSearchComponent.getDefaultResultsCount();

		assert.equal( searchResults, true, 'The API Search Results are not displayed.' );

		assert.equal( adminResults, true, 'The Admin Results are not displayed.' );

		assert.equal( defaultResultsCount, 6, 'The 6 Default Results are not displayed.' );
	} );

	step(
		'Shows "No results" indicator and re-displays contextual results for search queries which return no results',
		async function () {
			const invalidSearchQueryReturningNoResults = ';;;ppp;;;';

			await supportSearchComponent.searchFor( invalidSearchQueryReturningNoResults );

			const searchResults = await supportSearchComponent.waitForSearchResultsNotToBePresent();

			const resultsCount = await supportSearchComponent.getErrorResultsCount();

			const hasNoResultsMessage = await supportSearchComponent.hasNoResultsMessage();

			assert.equal( searchResults, true, 'The API Search Results are not displayed.' );

			assert.equal( hasNoResultsMessage, true, 'The "No results" message was not displayed.' );

			assert.equal( resultsCount, 6, 'The 6 default Error Results are not displayed.' );
		}
	);

	step( 'Clearing search resets to default state', async function () {
		await supportSearchComponent.clearSearchField();

		const errorResults = await supportSearchComponent.waitForErrorResultsNotToBePresent();

		const resultsCount = await supportSearchComponent.getDefaultResultsCount();

		assert.equal( errorResults, true, 'The default Error Results are not displayed.' );

		assert.equal( resultsCount, 6, 'The 6 Default Results are not displayed.' );
	} );

	step( 'Does not request API Search Results for empty search queries', async function () {
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
