/**
 * @group legal
 */
import { DataHelper, LoginPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';

const selectors = {
	isBlueLogin: '.is-section-login:not( .is-white-login )',
};
declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ), function () {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'ToS screenshots of WP.com blue login in desktop, tablet, and mobile viewports', function () {
		jest.setTimeout( 1800000 );
		const magnificientNonEnLocales = [
			'pt-br',
			'fr',
			'es',
			'de',
			'he',
			'ja',
			'it',
			'nl',
			'ru',
			'tr',
			'id',
			'zh-cn',
			'zh-tw',
			'ko',
			'ar',
			'sv',
		];

		it( 'Screenshot blue background login page in en and Mag-16 locales', async function () {
			const loginPage = new LoginPage( page );
			for ( const locale of [ 'en', ...magnificientNonEnLocales ] ) {
				page.setViewportSize( { width: 1280, height: 720 } );
				await loginPage.visit( { path: locale } );
				page.waitForSelector( selectors.isBlueLogin );
				await page.screenshot( {
					path: `tos_blue_login_desktop_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 410, height: 820 } );
				await page.screenshot( {
					path: `tos_blue_login_mobile_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1024, height: 1366 } );
				await page.screenshot( {
					path: `tos_blue_login_tablet_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
			}
		} );

		it( 'Zip screenshots and upload', async function () {
			const filetnameTitle = 'tos-screenshots-login-blue';
			const zipFilename = `${ filetnameTitle }.zip`;
			const result = await uploadScreenshotsToBlog( zipFilename, 'tos_blue_login_*' );

			expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );
			expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
		} );
	} );
} );
