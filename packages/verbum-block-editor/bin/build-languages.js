/* eslint-disable no-console */
/* eslint-disable import/no-nodejs-modules */
/**
 * Build a single language file for each language to `dist/languages` folder.
 */

const fs = require( 'fs' );
const resolve = require( 'path' ).resolve;
const languages = require( '@automattic/languages' );
const fetch = require( 'node-fetch' );

const outputPath = './dist/languages';
const bundleFile = './dist/block-editor.min.js';

fs.mkdirSync( outputPath, { recursive: true } );

const bundleContents = fs.readFileSync( bundleFile, 'utf8' ).toString();

const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );

const languagesUrlPattern =
	'https://translate.wordpress.org/projects/wp-plugins/gutenberg/stable/<languageSlug>/default/export-translations/?format=jed1x';

// Request and write language files
function downloadLanguages() {
	return Promise.all(
		langSlugs.map( async ( langSlug ) => {
			const translationUrl = languagesUrlPattern.replace( '<languageSlug>', langSlug );

			const response = await fetch( translationUrl );
			if ( response.status !== 200 ) {
				return null;
			}

			const json = await response.json();

			return { langSlug, languageTranslations: json };
		} )
	);
}

function buildLanguages( downloadedLanguages ) {
	// This is a very crude way to determine which phrases are used in the bundle.
	// Using POT files didn't work out because wp i18n doesn't pick up block names.
	// Nonetheless, this removes 70% of the phrases!
	const usedPhrases = Object.keys(
		downloadedLanguages[ 0 ].languageTranslations.locale_data.messages
	).filter(
		( key ) =>
			// The replace is needed to include phrases that are used with a context. like "Block title\u0004Paragraph block".
			// eslint-disable-next-line no-control-regex
			bundleContents.includes( key ) || bundleContents.includes( key.replace( /.*?\u0004/, '' ) )
	);

	downloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
		// Keep only used phrases.
		languageTranslations.locale_data.messages = Object.fromEntries(
			Object.entries( languageTranslations.locale_data.messages ).filter( ( [ key ] ) =>
				usedPhrases.includes( key )
			)
		);

		const output = resolve( process.cwd(), outputPath, `${ langSlug }-verbum.json` );
		fs.writeFileSync( output, JSON.stringify( languageTranslations ) );
	} );

	console.info( 'VBE: Language build completed.' );
}

async function run() {
	console.info( 'VBE: Starting language build...' );
	const downloadedLanguages = await downloadLanguages();
	buildLanguages( downloadedLanguages.filter( Boolean ) );
}

run();
