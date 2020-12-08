#!/usr/bin/env node
/**
 * Generate static design screenshot thumbnails for Gutenboarding
 * Until we can generate tall screenshots on the fly with mshots:
 * https://github.com/Automattic/mShots/issues/16
 * https://github.com/Automattic/wp-calypso/issues/40564
 *
 * SETUP:
 *
 * Ensure browser is installed by running `node ./bin/install-gutenboarding-design-thumbnails-dependencies.js`
 * Warning: this will remove your dist and node modules directories, and reinstall packages including the Chromium browser
 *
 * GENERATE THUMBNAILS:
 *
 * `node ./bin/generate-gutenboarding-design-thumbnails.js`
 *
 * We should bump the version query param on the image src to cache bust the images too in client/landing/gutenboarding/available-designs.ts
 *
 * To check the results, take a look at http://calypso.localhost:3000/new/design and the output folder static/images
 *
 */

const captureWebsite = require( 'capture-website' );
const sharp = require( 'sharp' );
const wpUrl = require( '@wordpress/url' );
const designs = require( '../client/landing/gutenboarding/available-designs-config.json' );
const screenshotsPath = './static/images/design-screenshots'; // Folder to store output images

// image output variables
const captureMaxHeight = 2200; // Cap long pages to  this pixel height when capturing
const outputWidth = 900; // Outputted file width
const viewportHeight = 800; // Browser height for capturing the screenshot
const viewportScaleFactor = 2; // Browser pixel density for capturing the screenshot
const viewportWidth = 1280; // Browser width for capturing the screenshot

const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';

const getDesignUrl = ( design ) => {
	return wpUrl.addQueryArgs(
		`${ designsEndpoint }${ encodeURIComponent( design.theme ) }/${ encodeURIComponent(
			design.template
		) }`,
		{
			font_base: design.fonts.base,
			font_headings: design.fonts.headings,
			site_title: design.title,
		}
	);
};

async function run() {
	if (
		( typeof designs === 'object' && ! Array.isArray( designs.featured ) ) ||
		! designs.featured
	) {
		console.error(
			'Could not find any featured designs. Check the regex or the available-designs.ts file'
		);
		return;
	}
	console.log( `Processing ${ designs.featured.length } designs...` );

	await Promise.all(
		designs.featured.map( async ( design ) => {
			const url = getDesignUrl( design );
			const file = `${ screenshotsPath }/${ design.slug }_${ design.template }_${ design.theme }`;

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

			[ 'webp', 'jpg' ].forEach( async ( extension ) => {
				let image = await sharp( screenshot );
				console.log( `Resizing and saving to ${ file }.${ extension }` );
				return await image
					.metadata()
					.then( ( metadata ) => {
						image = image
							.extract( {
								// Ensure we're not extracting taller area than screenshot actaully is
								height: Math.min( metadata.height, captureMaxHeight * viewportScaleFactor ),
								left: 0,
								top: 0,
								width: metadata.width,
							} )
							.resize( outputWidth );
						if ( extension === 'webp' ) {
							image = image.webp(); // default quality is 80
						} else {
							image = image.jpeg( { quality: 72 } );
						}
						image.toFile( `${ file }.${ extension }` );
					} )
					.catch( ( error ) => console.log( error ) );
			} );
		} )
	);

	console.log( 'Done!' );
}

run();
