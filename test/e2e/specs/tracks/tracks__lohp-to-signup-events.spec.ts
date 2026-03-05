import { DataHelper, TracksEventManager } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const lohpUrl: string = 'https://wordpress.com/?flags=a8c-analytics.on';

test.describe(
	DataHelper.createSuiteTitle( 'Verify Tracks events starting at LOHP' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		test( 'Loading LOHP fires wpcom_page_view event', async ( { pageIncognito } ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			tracksEventManager.init();

			const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );
			expect( await didEventFirePromise ).toBe( true );
		} );

		test( 'Clicking link on LOHP fires wpcom_homepage_link_click', async ( { pageIncognito } ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			tracksEventManager.init();

			await tracksEventManager.navigateToUrl( lohpUrl );

			const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_homepage_link_click' );
			await page.getByRole( 'link', { name: 'Get started' } ).first().click();
			expect( await didEventFirePromise ).toBe( true );
		} );

		test( 'Anon ids in page view events match when navigating from LOHP to Calypso signup', async ( {
			pageIncognito,
		} ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			tracksEventManager.init();

			let requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );

			let requestUrl = await requestUrlPromise;
			const anonIdFromWpcomPageView = tracksEventManager.getParamFromUrl( '_ui', requestUrl );

			requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'calypso_page_view' );
			await page.getByRole( 'link', { name: 'Get started' } ).first().click();

			requestUrl = await requestUrlPromise;

			expect( tracksEventManager.getParamFromUrl( '_en', requestUrl ) ).toBe( 'calypso_page_view' );
			expect( tracksEventManager.getParamFromUrl( '_ui', requestUrl ) ).toBe(
				anonIdFromWpcomPageView
			);
		} );
	}
);
