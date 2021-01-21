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

const fs = require( 'fs' );
const sharp = require( 'sharp' );
const puppeteer = require( 'puppeteer' );
const wpUrl = require( '@wordpress/url' );

const designs = require( '../client/landing/gutenboarding/available-designs-config.json' );
const config = require( '../client/server/config/index.js' );

const mag16 = config( 'magnificent_non_en_locales' ) || [];
const screenshotsBasePath = './static/images/design-screenshots'; // Folder to store output images

// image output variables
const captureMaxHeight = 3072; // Cap long pages to  this pixel height when capturing
const outputWidth = 900; // Outputted file width
const viewportHeight = 800; // Browser height for capturing the screenshot
const viewportScaleFactor = 2; // Browser pixel density for capturing the screenshot
const viewportWidth = 900; // Browser width for capturing the screenshot

// "Debug" dumps the intermediate screenshot and is significantly more verbose
const debug = false;

const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';

const specialCaseArguments = {
	all: [ '', ...config( 'magnificent_non_en_locales' ) ],
	en: [ '' ],
	mag16: config( 'magnificent_non_en_locales' ),
};

const inputSlugs = ( process.argv[ 2 ] || '' )
	.split( ',' )
	.filter( ( potentialSlug ) => mag16.includes( potentialSlug ) );

// For convenience:
// replace an 'all' input with the mag 16
// accept an empty locale input and replacefor convenience

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
	console.log(
		`Processing ${ designs.featured.length } designs for each of ${
			localeSlugs.length
		} locales (${ localeSlugs.join( ', ' ) })... `
	);

	// Initialize puppeteer and the page object
	const browser = await puppeteer.launch( {
		headless: true,
		timeout: 60000,
		ignoreHTTPSErrors: true,
	} );
	const page = await browser.newPage();
	const width = viewportWidth;
	const height = viewportHeight;
	await page.setViewport( {
		width,
		height,
		scaleFactor: viewportScaleFactor,
	} );

	await page.setCacheEnabled( false );
	await page._client.send( 'Page.setDownloadBehavior', { behavior: 'deny' } );

	// If we run even 2 capture-website/puppeteer/chromium instances
	// concurrently things get very unstable, so we're going to use a good
	// old-fashioned for loop to keep things serialized.
	for ( let ii = 0; ii < localeSlugs.length; ii++ ) {
		const locale = localeSlugs[ ii ];
		const screenshotsPath = locale ? `${ screenshotsBasePath }/${ locale }` : screenshotsBasePath;
		fs.mkdirSync( screenshotsPath, { recursive: true } );

		for ( let i = 0; i < designs.featured.length; i++ ) {
			const design = designs.featured[ i ];

			const url = getDesignUrl( design, locale );
			const file = `${ screenshotsPath }/${ design.slug }_${ design.template }_${ design.theme }`;

			console.log( `Loading ${ url }` );

			const response = await page.goto( url, { waitUntil: 'networkidle0' } );
			if ( ! ( response && response.ok() ) ) {
				console.log( 'Error loading page: ', response );
				throw response;
			}

			const scrollHeight = await page.evaluate( () => document.body.scrollHeight );

			debug && console.log( 'Total height of page:', scrollHeight );

			// Fix `reynolds_rockfield2_rockfield.jpg` first section becoming super tall
			// TODO: check if this is still necessary
			const styles =
				design.slug === 'reynolds'
					? [ `.wp-block-cover, .wp-block-cover-image { min-height: ${ viewportHeight }px; }` ]
					: [];

			const screenshotOptions = {
				fullPage: false,
				type: 'jpeg',
				quality: 90,
				styles,
			};

			const screenshots = [];

			const snapshotHeight = viewportHeight;

			try {
				for (
					let //remaining = scrollHeight,
						screenshotIndex = 0,
						top = 0;
					top < scrollHeight;
					top += snapshotHeight, screenshotIndex++
				) {
					// Puppeteer's clip regions get squirrelly when scrolling,
					// so every shot will be full-sized, and if the last shot
					// is not an exact multiple we'll adjust it's position in
					// the final composite
					const remaining = scrollHeight - top;
					if ( remaining < snapshotHeight ) {
						top -= snapshotHeight - remaining;
					}
					// const height = Math.min( remaining, snapshotHeight );

					// TODO: add some more smarts here to handle parallax
					// themes. e.g. the second rockfield_rockfield_rockfield
					// background image is broken at the seam between two
					// screenshots because the background image moved between
					// them.
					// If this doesn't make sense, have a look at the demo and
					// think about scrolling down and stiching screenshots
					// together:
					// https://public-api.wordpress.com/rest/v1/template/demo/rockfield/rockfield?font_base=Fira%20Sans&font_headings=Playfair%20Display&site_title=Rockfield&language=es

					await page.evaluate( ( top ) => window.scrollTo( { top, behaviour: 'auto' } ), top ); // eslint-disable-line no-shadow

					// Save out intermediate screenshots if debug flag is set
					const fileName = `${ file }_${ String( screenshotIndex ).padStart( 2, 0 ) }.jpg`;
					debug && console.log( 'creating', fileName );
					const maybePathOption = debug ? { path: fileName } : {};

					const newScreenshot = await page.screenshot( {
						width,
						height,
						...maybePathOption,
						...screenshotOptions,
					} );

					// hide floating header after the first screenshot to
					// avoid it being duplicated each frame
					if ( screenshotIndex === 0 ) {
						await page.addStyleTag( { content: 'header#masthead{display: none}' } );
					}

					// Check result matches expectations
					if ( debug ) {
						const metadata = await sharp( newScreenshot ).metadata();
						[ 'width', 'height' ].forEach(
							( property ) =>
								metadata[ property ] === eval( property ) ||
								console.log(
									`Unexpected ${ property } in screenshot ${ screenshotIndex }. Expected ${ eval(
										property
									) }, got ${ metadata[ property ] }`
								)
						);
					}

					screenshots.push( { input: newScreenshot, top, left: 0, width, height } );
				}
			} catch ( e ) {
				if (
					typeof e.message === 'string' &&
					e.message.includes( 'Run "npm install" or "yarn install" to download a browser binary.' )
				) {
					console.error(
						'\n\nPlease run `PUPPETEER_SKIP_DOWNLOAD= yarn install` to install the chromium binaries required for this script and then try again.'
					);
					process.exit( 1 );
				} else {
					console.error( 'Error taking screenshot:', e );
				}
			}

			// Node needs this `Promise.all` to know when to end the script,
			// even though (because?) we don't need to do anything afterwards
			await Promise.all(
				[ 'webp', 'jpg' ].map( async ( extension ) => {
					// return;
					console.log( `Compositing, resizing and saving to ${ file }.${ extension }` );

					const image = sharp( {
						create: {
							width: viewportWidth,
							height: scrollHeight,
							channels: 3,
							background: { r: 255, g: 0, b: 255 },
						},
					} ).composite( screenshots );

					return (
						image &&
						( await image.metadata().then( ( metadata ) => {
							if ( debug ) {
								console.log( 'Final image metadata:', metadata );
							}

							let formattedImage = image
								.extract( {
									// Ensure we're not extracting taller area than screenshot actaully is
									height: Math.min( metadata.height, captureMaxHeight * viewportScaleFactor ),
									left: 0,
									top: 0,
									width: metadata.width,
								} )
								.resize( outputWidth );

							if ( extension === 'webp' ) {
								formattedImage = image.webp(); // default quality is 80
							} else {
								formattedImage = image.jpeg( { quality: 72 } );
							}

							formattedImage.toFile( `${ file }.${ extension }` );
						} ) )
					);
				} )
			);
		}
	}

	console.log( 'Done!' );
}

run()
	.then( () => process.exit( 0 ) )
	.catch( ( e ) => {
		console.error( e );
		process.exit( 1 );
	} );
