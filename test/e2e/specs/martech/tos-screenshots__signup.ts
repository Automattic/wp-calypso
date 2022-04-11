/**
 * @group legal
 */
import fs from 'fs';
import { DataHelper, UserSignupPage } from '@automattic/calypso-e2e';
import archiver from 'archiver';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Page, Browser } from 'playwright';

const selectors = { isWhiteSignup: 'body.is-white-signup.is-section-signup' };
declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ), function () {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'ToS screenshots of WP.com signup in desktop, tablet, and mobile viewports', function () {
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

		it( 'Screenshot white background signup page in en and Mag-16 locales', async function () {
			const userSignupPage = new UserSignupPage( page );
			for ( const locale of [ ...magnificientNonEnLocales, 'en' ] ) {
				page.setViewportSize( { width: 1280, height: 720 } );
				await userSignupPage.visit( { path: locale } );
				page.waitForSelector( selectors.isWhiteSignup );
				await page.screenshot( {
					path: `tos_white_signup_desktop_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 410, height: 820 } );
				await page.screenshot( {
					path: `tos_white_signup_mobile_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1024, height: 1366 } );
				await page.screenshot( {
					path: `tos_white_signup_tablet_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
			}
		} );

		it( 'Zip screenshots and upload', async function () {
			const filetnameTitle = 'tos-screenshots-signup';
			const zipFilename = `${ filetnameTitle }.zip`;
			const archive = archiver( 'zip', {
				zlib: { level: 9 }, // Sets the compression level.
			} );
			const output = fs.createWriteStream( zipFilename );
			archive.pipe( output );
			archive.glob( 'tos_white_signup_*' );
			archive.finalize();

			const fsStreamEndPromise = new Promise( ( resolve ) => {
				return output.on( 'close', function () {
					return resolve( 'closed' );
				} );
			} );
			await fsStreamEndPromise;

			const form = new FormData();
			const bearerToken = DataHelper.getTosUploadToken();
			form.append( 'media[]', fs.createReadStream( zipFilename ) );
			const response = await fetch(
				`https://public-api.wordpress.com/rest/v1.1/sites/${ DataHelper.getTosUploadDestination() }/media/new`,
				{
					method: 'POST',
					body: form,
					headers: {
						Authorization: `Bearer ${ bearerToken }`,
					},
				}
			);
			const result = await response.json();

			expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );

			expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
		} );
	} );
} );
