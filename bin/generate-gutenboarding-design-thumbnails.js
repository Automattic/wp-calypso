#!/usr/bin/env node
/**
 * Generate static design screenshot thumbnails for Gutenboarding
 * Until we can generate tall screenshots on the fly with mshots:
 * https://github.com/Automattic/mShots/issues/16
 * https://github.com/Automattic/wp-calypso/issues/40564
 *
 * You'll need Puppeteer installed.
 * Change `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`in `package.json` to `false` and run `npm ci`
 */

const designs = require( '../client/landing/gutenboarding/available-designs.json' );
const puppeteer = require( 'puppeteer' );
const wpUrl = require( '@wordpress/url' );

const screenshotsPath = './static/page-templates/design-screenshots';

const getDesignUrl = design => {
	return wpUrl.addQueryArgs( design.src, {
		font_headings: design.fonts[ 0 ],
		font_base: design.fonts[ 1 ],
	} );
};

async function run() {
	console.log( 'Taking screenshots...' );
	const browser = await puppeteer.launch( { headless: true } );

	await Promise.all(
		designs.featured.map( async design => {
			const url = getDesignUrl( design );
			const screenshotFile = `${ screenshotsPath }/${ design.slug }_${ design.template }_${ design.theme }.jpg`;

			console.log( `Opening ${ url }` );
			const page = await browser.newPage();
			await page.setViewport( {
				width: 980,
				height: 2200,
				deviceScaleFactor: 1,
			} );
			await page.goto( url, { waitUntil: 'networkidle2' } );

			console.log( `Taking screenshot and saving it to ${ screenshotFile }` );
			await page.screenshot( {
				fullPage: false,
				path: screenshotFile,
				quality: 90,
				type: 'jpeg',
			} );

			return page.close();
		} )
	);

	await browser.close();
	console.log( 'Done' );
}

run();
