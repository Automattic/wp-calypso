/**
 * @group quarantined
 */

import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

const TIMEOUT_1_HOUR = 60 * 60 * 1000;
jest.setTimeout( TIMEOUT_1_HOUR );

describe( DataHelper.createSuiteTitle( 'Theme Switch' ), () => {
	// twentyeleven
	const FROM = 'hemingway-rewritten';
	// const FROM = 'appleton';
	// const FROM = 'pendant';

	// const TO = 'hemingway-rewritten';
	// const TO = 'pendant';
	const TO = 'appleton';

	let page: Page;
	let selectedDomain: string;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( `Switch from the ${ FROM } theme to the ${ TO } theme (preserve)`, function () {
		it( 'Login', async function () {
			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		it( 'Select the FROM theme', async function () {
			await page.goto(
				DataHelper.getCalypsoURL( '/start/with-theme/user', {
					theme: FROM,
					theme_type: 'free',
				} )
			);
		} );

		it( 'Select domain', async function () {
			await page.fill( 'input[type="search"]', 'test' );
			const targetItem = await page.waitForSelector(
				`.domain-suggestion__content:has-text("${ '.wordpress.com' }")`
			);
			selectedDomain = await targetItem.waitForSelector( 'h3' ).then( ( el ) => el.innerText() );
			await targetItem.click();
			await page.getByText( 'start with a free site' ).click();
			await page.waitForNavigation( { timeout: 60 * 1000 } );
		} );

		it( 'Go to the FROM site', async function () {
			await page.goto( `https://${ selectedDomain }` );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/0-site.png`, fullPage: true } );

			await page.goto( DataHelper.getCalypsoURL( `/posts/${ selectedDomain }` ) );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/1-posts.png` } );

			await page.goto( DataHelper.getCalypsoURL( `/pages/${ selectedDomain }` ) );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/2-pages.png` } );
			const homepageAsPage = page.locator( '.page__main', {
				has: page.locator( '.page-card-info__badge-text', { hasText: 'Homepage' } ),
			} );
			if ( await homepageAsPage.isVisible() ) {
				await homepageAsPage.locator( '.page__title' ).click();
				await page.waitForTimeout( 5 * 1000 );
				await page.screenshot( {
					path: `results/from ${ FROM }/to ${ TO }/3-homepage-as-page.png`,
				} );
			}

			await page.goto( DataHelper.getCalypsoURL( `/settings/reading/${ selectedDomain }` ) );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/4-reading-setting.png` } );
		} );

		it( 'Switch the theme', async function () {
			await page.goto( DataHelper.getCalypsoURL( `/themes/${ TO }/${ selectedDomain }` ) );
			await page.getByText( 'Activate this design' ).click();

			const themeSwitchModal = '.themes__auto-loading-homepage-modal';
			await page.locator( themeSwitchModal );
			await page.waitForTimeout( 2 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/to ${ TO }/0-switch-modal.png` } );

			await page.locator( `[data-e2e-button="activeTheme"]` ).click();
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/to ${ TO }/1-activated.png` } );
		} );

		it( 'Go to the TO site', async function () {
			await page.goto( `https://${ selectedDomain }` );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( {
				path: `results/from ${ FROM }/to ${ TO }/2-site.png`,
				fullPage: true,
			} );

			await page.goto( DataHelper.getCalypsoURL( `/posts/${ selectedDomain }` ) );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/to ${ TO }/3-posts.png` } );

			await page.goto( DataHelper.getCalypsoURL( `/pages/${ selectedDomain }` ) );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/to ${ TO }/4-pages.png` } );
			const homepageAsPage = page.locator( '.page__main', {
				has: page.locator( '.page-card-info__badge-text', { hasText: 'Homepage' } ),
			} );
			if ( await homepageAsPage.isVisible() ) {
				await homepageAsPage.locator( '.page__title' ).click();
				// await page.locator( '.edit-post-sidebar' ).isVisible();
				await page.waitForTimeout( 5 * 1000 );
				await page.screenshot( {
					path: `results/from ${ FROM }/to ${ TO }/5-homepage-as-page.png`,
				} );
			}

			await page.goto( DataHelper.getCalypsoURL( `/settings/reading/${ selectedDomain }` ) );
			await page.waitForTimeout( 1 * 1000 );
			await page.screenshot( { path: `results/from ${ FROM }/to ${ TO }/6-reading-setting.png` } );
		} );

		it( 'Wait for debug', async function () {
			await page.waitForTimeout( TIMEOUT_1_HOUR );
		} );
	} );
} );
