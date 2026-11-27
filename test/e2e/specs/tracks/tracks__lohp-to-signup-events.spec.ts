import { DataHelper, TracksEventManager } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const lohpUrl: string = 'https://wordpress.com/?flags=a8c-analytics.on';

test.describe(
	DataHelper.createSuiteTitle( 'Verify Tracks events starting at LOHP' ),
	// The mobile homepage shows no visible signup "Get started" for the click tests.
	{ tag: [ tags.CALYPSO_RELEASE, tags.DESKTOP_ONLY ] },
	() => {
		test( 'Loading LOHP fires wpcom_page_view event', async ( { pageIncognito } ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			await tracksEventManager.init();

			const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );
			expect( await didEventFirePromise ).toBe( true );
		} );

		test( 'Clicking link on LOHP fires wpcom_homepage_link_click', async ( { pageIncognito } ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			await tracksEventManager.init();

			const pageViewPromise = tracksEventManager.didEventFire( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );
			await pageViewPromise;

			const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_homepage_link_click' );
			await page.getByRole( 'menuitem', { name: 'Get started' } ).click();
			expect( await didEventFirePromise ).toBe( true );
		} );

		test( 'Anon ids in page view events match when navigating from LOHP to Calypso signup', async ( {
			pageIncognito,
		} ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			await tracksEventManager.init();

			let requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );

			let requestUrl = await requestUrlPromise;
			const anonIdFromWpcomPageView = tracksEventManager.getParamFromUrl( '_ui', requestUrl );

			requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'calypso_page_view' );
			await page.getByRole( 'menuitem', { name: 'Get started' } ).click();

			requestUrl = await requestUrlPromise;

			expect( tracksEventManager.getParamFromUrl( '_en', requestUrl ) ).toBe( 'calypso_page_view' );
			expect( tracksEventManager.getParamFromUrl( '_ui', requestUrl ) ).toBe(
				anonIdFromWpcomPageView
			);
		} );
	}
);
