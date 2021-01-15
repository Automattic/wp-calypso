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
 * or
 * `node ./bin/generate-gutenboarding-design-thumbnails.js all`
 * `node ./bin/generate-gutenboarding-design-thumbnails.js mag16`
 * `node ./bin/generate-gutenboarding-design-thumbnails.js es`
 * `node ./bin/generate-gutenboarding-design-thumbnails.js fr,de,zh-cn`
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
const screenshotsBasePath = './static/images/design-screenshots'; // Folder to store output images

const config = require( '../client/server/config/index.js' );
const mag16 = config( 'magnificent_non_en_locales' ) || [];

// image output variables
const captureMaxHeight = 2200; // Cap long pages to  this pixel height when capturing
const outputWidth = 900; // Outputted file width
const viewportHeight = 800; // Browser height for capturing the screenshot
const viewportScaleFactor = 2; // Browser pixel density for capturing the screenshot
const viewportWidth = 1280; // Browser width for capturing the screenshot

const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';

const inputSlugs = ( process.argv[ 2 ] || '' )
	.split( ',' )
	.filter( ( potentialSlug ) => mag16.includes( potentialSlug ) );

// For convenience:
// replace an 'all' input with the mag 16
// accept an empty locale input and replacefor convenience
const specialCaseArguments = {
	all: [ '', ...config( 'magnificent_non_en_locales' ) ],
	en: [ '' ],
	mag16: config( 'magnificent_non_en_locales' ),
};

const localeSlugs = inputSlugs.length
	? specialCaseArguments[ inputSlugs[ 0 ] ] || inputSlugs
	: [ '' ];

const getDesignUrl = ( design, language = 'en' ) => {
	return wpUrl.addQueryArgs(
		`${ designsEndpoint }${ encodeURIComponent( design.theme ) }/${ encodeURIComponent(
			design.template
		) }`,
		{
			font_base: design.fonts.base,
			font_headings: design.fonts.headings,
			site_title: design.title,
			...( language && language !== 'en' && { language } ),
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
	console.log( `for each of ${ localeSlugs.join( ', ' ) } (${ localeSlugs.length } locales)...` );

	// If we run even 2 capture-website/puppeteer/chromium instances
	// concurrently things get very unstable, so we're going to use a good
	// old-fashioned for loop to keep things serialized.
	for ( let ii = 0; ii < localeSlugs.length; ii++ ) {
		const locale = localeSlugs[ ii ];
		for ( let i = 0; i < designs.featured.length; i++ ) {
			const design = designs.featured[ i ];

			const url = getDesignUrl( design, locale );
			const screenshotsPath = locale ? `${ screenshotsBasePath }/${ locale }` : screenshotsBasePath;
			const file = `${ screenshotsPath }/${ design.slug }_${ design.template }_${ design.theme }`;

			// Fix `reynolds_rockfield2_rockfield.jpg` first section becoming super tall
			// @TODO: fix at the source since this will be an issue with mshots API, too.
			const styles =
				design.slug === 'reynolds'
					? [ `.wp-block-cover, .wp-block-cover-image { min-height: ${ viewportHeight }px; }` ]
					: [];

			console.log( `Taking screenshot of ${ url }` );

			let screenshot;
			try {
				screenshot = await captureWebsite.buffer( url, {
					fullPage: true,
					height: viewportHeight,
					scaleFactor: viewportScaleFactor,
					styles,
					type: 'png',
					width: viewportWidth,
				} );
			} catch ( e ) {
				if (
					typeof e.message === 'string' &&
					e.message.includes( 'Run "npm install" or "yarn install" to download a browser binary.' )
				) {
					console.error(
						'\n\nPlease run `PUPPETEER_SKIP_DOWNLOAD= yarn install` to install the chromium binaries required for this script and then try again.'
					);
					process.exit( 1 );
				}
				console.log( 'screenshot error:', e );
			}

			[ 'webp', 'jpg' ].forEach( async ( extension ) => {
				console.log( `Resizing and saving to ${ file }.${ extension }` );
				let image = await sharp( screenshot );

				return (
					image &&
					( await image
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
						.catch( ( error ) => console.log( error ) ) )
				);
			} );
		}
	}

	console.log( 'Done!' );
}

run();
