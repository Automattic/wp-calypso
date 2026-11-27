import { DataHelper, TracksEventManager } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import type { Page } from '@playwright/test';

const lohpUrl: string = 'https://wordpress.com/?flags=a8c-analytics.on';

async function clickGetStarted( page: Page, viewportName: string ) {
	if ( viewportName === 'mobile' ) {
		await page.getByRole( 'menuitem', { name: 'Menu' } ).click();
		await page.getByRole( 'link', { name: 'Get started' } ).first().click();
	} else {
		await page.getByRole( 'menuitem', { name: 'Get started' } ).click();
	}
}

test.describe(
	DataHelper.createSuiteTitle( 'Verify Tracks events starting at LOHP' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		test( 'Loading LOHP fires wpcom_page_view event', async ( { pageIncognito } ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			await tracksEventManager.init();

			const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );
			expect( await didEventFirePromise ).toBe( true );
		} );

		test( 'Clicking link on LOHP fires wpcom_homepage_link_click', async ( {
			pageIncognito,
			viewportName,
		} ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			await tracksEventManager.init();

			const pageViewPromise = tracksEventManager.didEventFire( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );
			await pageViewPromise;

			const didEventFirePromise = tracksEventManager.didEventFire( 'wpcom_homepage_link_click' );
			await clickGetStarted( page, viewportName );
			expect( await didEventFirePromise ).toBe( true );
		} );

		test( 'Anon ids in page view events match when navigating from LOHP to Calypso signup', async ( {
			pageIncognito,
			viewportName,
		} ) => {
			const page = pageIncognito.getPage();
			const tracksEventManager = new TracksEventManager( page );
			await tracksEventManager.init();

			let requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'wpcom_page_view' );
			await tracksEventManager.navigateToUrl( lohpUrl );

			let requestUrl = await requestUrlPromise;
			const anonIdFromWpcomPageView = tracksEventManager.getParamFromUrl( '_ui', requestUrl );

			requestUrlPromise = tracksEventManager.getRequestUrlForEvent( 'calypso_page_view' );
			await clickGetStarted( page, viewportName );

			requestUrl = await requestUrlPromise;

			expect( tracksEventManager.getParamFromUrl( '_en', requestUrl ) ).toBe( 'calypso_page_view' );
			expect( tracksEventManager.getParamFromUrl( '_ui', requestUrl ) ).toBe(
				anonIdFromWpcomPageView
			);
		} );
	}
);
