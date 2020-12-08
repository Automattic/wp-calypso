/**
 * External dependencies
 */
import playwright from 'playwright';
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as dataHelper from '../lib/data-helper';
import * as driverManager from '../lib/driver-manager';

import LoginFlow from '../lib/flows/login-flow-playwright.js';

import SupportPage from '../lib/pages/support-page-playwright.js';

import SidebarComponent from '../lib/components/sidebar-component-playwright.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser = 'gutenbergSimpleSiteUser';

let browser;
let context;

before( async function () {
	browser = await playwright.chromium.launch( { headless: false, devtools: false } );
	context = await browser.newContext();
} );

describe( `[${ host }] Inline Help: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	let page;

	it( `Login and select Settings`, async function () {
		this.LoginFlow = new LoginFlow( context, gutenbergUser );
		page = await this.LoginFlow.loginAndSelectSettings();
		this.supportPage = new SupportPage( page );
		this.sidebarComponent = new SidebarComponent( page );
		return await this.sidebarComponent._init();
	} );

	describe( `Popover UI visibility`, function () {
		it( `Check help toggle is not visible on My Home Page`, async function () {
			await this.sidebarComponent.selectMyHome();
			const visible = await this.supportPage.inlineHelpButtonVisible();
			assert.strictEqual(
				visible,
				false,
				'Inline Help button unexpectedly visisble on My Home Page.'
			);
		} );

		it( `Check help toggle is visible on Settings page`, async function () {
			await this.sidebarComponent.selectSettings();
			const visible = await this.supportPage.inlineHelpButtonVisible();
			assert.strictEqual(
				visible,
				true,
				'Inline Help button unexpectedly not visible on Settings page.'
			);
		} );
	} );

	describe( `Performing searches`, function () {
		it( `Open Inline Help popover`, async function () {
			const inlineHelpVisible = await this.supportPage.openInlineHelp();
			assert.strictEqual( inlineHelpVisible, true, 'Inline Help popover could not be opened.' );
		} );

		it( `Displays contextual search results by default`, async function () {
			await this.supportPage.openInlineHelp();
			const defaultHelpResults = await this.supportPage.getDefaultResultCount();
			assert.strictEqual( defaultHelpResults, 6, 'There are no contextual results displayed' );
		} );

		it( `Returns search results for valid search query`, async function () {
			await this.supportPage.searchForQuery( 'Podcast' );
			const resultCount = await this.supportPage.getResultCount();
			assert.strictEqual(
				resultCount <= 5,
				true,
				'Too many search results displayed. Should be less than or equal to 5.'
			);
			assert.strictEqual(
				resultCount >= 1,
				true,
				'Too few search results displayed. Should be more than or equal to 1.'
			);
		} );

		it( `Resets search UI to default state when search input is cleared`, async function () {
			await this.supportPage.clearSearchField();

			const defaultHelpResults = await this.supportPage.getDefaultResultCount();
			assert.strictEqual( defaultHelpResults, 6, 'There are no contextual results displayed.' );
		} );

		it( `Shows "No results" indicator and re-displays contextual results for search queries which return no results`, async function () {
			await this.supportPage.searchForQuery( ';;;ppp;;;' );

			const noResultsMessage = await this.supportPage.searchReturnedNoResultsMessage();
			const resultCount = await this.supportPage.getDefaultResultCount();

			assert.strictEqual( noResultsMessage, true, 'The "No results" message was not displayed.' );
			assert.strictEqual( resultCount, 6, 'There are no contextual results displayed.' );
		} );

		it( `Does not request search results for empty search queries`, async function () {
			await this.supportPage.clearSearchField();
			await this.supportPage.searchForQuery( '         ' );

			const noResultsMessage = await this.supportPage.searchReturnedNoResultsMessage();
			const resultCount = await this.supportPage.getDefaultResultCount();

			assert.strictEqual(
				noResultsMessage,
				false,
				'The "No Results" message was unexpectedly displayed.'
			);
			assert.strictEqual( resultCount, 6, 'There are no contextual results displayed.' );
		} );

		it( `Close Inline Help popover`, async function () {
			const closed = await this.supportPage.closeInlineHelp();
			assert.strictEqual( closed, true, 'The Inline Help popover was not closed correctly.' );
		} );
	} );
} );

after( async function () {
	await browser.close();
} );
