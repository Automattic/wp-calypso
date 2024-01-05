/**
 * TODO: decide on group - maybe once a day rather than per PR or release?
 * @group calypso-release
 */

import { DataHelper, TracksEventManager } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Verify Tracks events starting at LOHP' ), function () {
	let page: Page;
	let tracksEventManager: TracksEventManager;
	const lohpUrl: string = 'https://wordpress.com/?flags=a8c-analytics.on';

	beforeEach( async () => {
		page = await browser.newPage();
		tracksEventManager = new TracksEventManager( page );
		tracksEventManager.allowTestsToFireEvents();
	} );

	afterEach( async () => {
		await page.close();
	} );

	it( 'Loading LOHP fires wpcom_page_view event', async function () {
		// Set up listener for wpcom_page_view event
		const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_page_view' );

		// Navigate to LOHP
		await tracksEventManager.navigateToUrl( lohpUrl );

		// Expect the event to fire
		expect( await didEventFirePromise ).toBe( true );
	} );

	it( 'Clicking link on LOHP fires wpcom_link_click', async function () {
		// Navigate to LOHP
		await tracksEventManager.navigateToUrl( lohpUrl );

		// Set up listener for wpcom_link_click event
		const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_link_click' );

		// Click first signup link to go to signup page
		await page.click( 'a[href*="https://wordpress.com/start"]' );

		// Expect the event to fire
		expect( await didEventFirePromise ).toBe( true );
	} );

	it( 'Anon ids in page view events match when navigating from LOHP to Calypso signup', async function () {
		// Set up listener for wpcom_page_view event
		let requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'wpcom_page_view' );

		// Navigate to LOHP
		await tracksEventManager.navigateToUrl( lohpUrl );

		// Get anon id from wpcom_page_view event
		let requestUrl = await requestUrlPromise;
		const anonIdFromWpcomPageView = tracksEventManager.getParamFromUrl( '_ui', requestUrl );

		// Set up listener for calypso_page_view event
		requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'calypso_page_view' );

		// Click first signup link to go to signup page
		await page.click( 'a[href*="https://wordpress.com/start"]' );
		requestUrl = await requestUrlPromise;

		const anonIdFromCalypsoPageView = tracksEventManager.getParamFromUrl( '_ui', requestUrl );

		// Expect anon ids in wpcom and calypso page view events to match
		expect( anonIdFromCalypsoPageView ).toBe( anonIdFromWpcomPageView );
	} );

	/**
	 * Used to test the timeout
	 * Leaving commented out for now to not slow down tests
	 */
	// eslint-disable-next-line jest/no-commented-out-tests
	// it( 'Bad event does not fire when loading LOHP', async function () {
	// 	// Set up listener for wpcom_page_view event
	// 	const didEventFirePromise = tracksEventManager.didEventFire( 'bad_event_name_abcde12345' );

	// 	// Navigate to LOHP
	// 	await tracksEventManager.navigateToUrl( lohpUrl );

	// 	// Expect the event to fire
	// 	expect( await didEventFirePromise ).toBe( false );
	// } );
} );
