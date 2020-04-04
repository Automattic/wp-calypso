#!/usr/bin/env node
/**
 * Generate static design screenshot thumbnails for Gutenboarding
 * Until we can generate tall screenshots on the fly with mshots:
 * https://github.com/Automattic/mShots/issues/16
 * https://github.com/Automattic/wp-calypso/issues/40564
 *
 * You'll need capture-website and sharp:
 *
 * npm i capture-website sharp
 *
 * (I didn't want to add these to dependencies just for this script since these are kinda heavy ones)
 * https://www.npmjs.com/package/capture-website
 * https://www.npmjs.com/package/sharp
 *
 * Ensure browser is installed by removing `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` in `package.json` and run `npm ci`
 * (maybe there's easier way?)
 *
 *
 * Then convert this file to json:
 * client/landing/gutenboarding/available-designs.ts
 * - Rename to .json
 * - Remove some JS to make it look more like json
 * - run `npx prettier client/landing/gutenboarding/available-designs.json --write` to fix the rest
 */

const captureWebsite = require( 'capture-website' );
const designs = require( '../client/landing/gutenboarding/available-designs.json' );
const sharp = require( 'sharp' );
const wpUrl = require( '@wordpress/url' );

const screenshotsPath = './static/page-templates/design-screenshots'; // Folder to store output images
const captureMaxHeight = 2200; // Cap long pages to  this pixel height when capturing
const outputWidth = 600; // Outputted file width
const viewportHeight = 800; // Browser height for capturing the screenshot
const viewportScaleFactor = 2; // Browser pixel density for capturing the screenshot
const viewportWidth = 1280; // Browser width for capturing the screenshot

const getDesignUrl = design => {
	return wpUrl.addQueryArgs( design.src, {
		font_base: design.fonts.base,
		font_headings: design.fonts.headings,
		site_title: design.title,
	} );
};

async function run() {
	await Promise.all(
		designs.featured.map( async design => {
			const url = getDesignUrl( design );
			const file = `${ screenshotsPath }/${ design.slug }_${ design.template }_${ design.theme }.jpg`;

			// Fix `reynolds_rockfield2_rockfield.jpg` first section becoming super tall
			// @TODO: fix at the source since this will be an issue with mshots API, too.
			const styles =
				design.slug === 'reynolds'
					? [ `.wp-block-cover, .wp-block-cover-image { min-height: ${ viewportHeight }px; }` ]
					: [];

			console.log( `Taking screenshot of ${ url }` );
			const screenshot = await captureWebsite.buffer( url, {
				fullPage: true,
				height: viewportHeight,
				scaleFactor: viewportScaleFactor,
				styles,
				type: 'png',
				width: viewportWidth,
			} );

			console.log( `Resizing and saving to ${ file }` );
			const image = await sharp( screenshot );
			return await image.metadata().then( metadata => {
				return image
					.extract( {
						// Ensure we're not extracting taller area than screenshot actaully is
						height: Math.min( metadata.height, captureMaxHeight * viewportScaleFactor ),
						left: 0,
						top: 0,
						width: metadata.width,
					} )
					.resize( outputWidth )
					.jpeg( { quality: 90 } )
					.toFile( file );
			} );
		} )
	);

	console.log( 'Done!' );
}

run();
