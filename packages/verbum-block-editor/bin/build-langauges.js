/* eslint-disable no-console */
/* eslint-disable import/no-nodejs-modules */
/**
 * Build a single language file for each language to `dist/languages` folder.
 *
 * The script,
 * - Pulls full translations from `https://widgets.wp.com/languages/calypso`
 * - Merges all referenced strings together
 * - Picks only the necessary translations from the full translations files
 * - Creates the target language files in outputPath (defaults to `dist/languages`).
 */

const fs = require( 'fs' );
const resolve = require( 'path' ).resolve;
const languages = require( '@automattic/languages' );
const parse = require( 'gettext-parser' ).po.parse;
const _ = require( 'lodash' );
const fetch = require( 'node-fetch' );

const outputPath = './dist/languages';
const stringsFilePath = './dist/vbe-strings.pot';
const verbose = false;

fs.mkdirSync( outputPath, { recursive: true } );

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
			console.log( `Downloading ${ translationUrl } complete.` );

			return { langSlug, languageTranslations: json };
		} )
	);
}

// Split language translations
function buildLanguages( downloadedLanguages ) {
	if ( verbose ) {
		console.log( 'Building languages...' );
	}

	if ( fs.existsSync( stringsFilePath ) ) {
		const { translations } = parse( fs.readFileSync( stringsFilePath ) );
		const translationsFlatten = _.reduce(
			translations,
			( result, contextTranslations, context ) => {
				const mappedTranslations = _.mapKeys( contextTranslations, ( value, key ) => {
					let mappedKey = key.replace( /\\u([0-9a-fA-F]{4})/g, ( match, matchedGroup ) =>
						String.fromCharCode( parseInt( matchedGroup, 16 ) )
					);

					if ( context ) {
						mappedKey = context + String.fromCharCode( 4 ) + mappedKey;
					}

					return mappedKey;
				} );

				return _.merge( result, mappedTranslations );
			},
			{}
		);

		const allStrings = Object.keys( translationsFlatten ).flat();

		downloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
			languageTranslations.locale_data.messages = _.pick(
				languageTranslations.locale_data.messages,
				allStrings
			);
			const output = resolve( process.cwd(), outputPath, `${ langSlug }-v1.1.json` );
			if ( verbose ) {
				console.log( `Writing ${ output }...` );
			}
			fs.writeFileSync( output, JSON.stringify( languageTranslations ) );
		} );

		if ( verbose ) {
			console.log( 'Updating language revisions...' );
		}
	} else {
		console.error( `${ stringsFilePath } is missing` );
	}

	console.info( '✅ Language build completed.' );
}

async function run() {
	console.info( 'ℹ️ Starting language build...' );
	const downloadedLanguages = await downloadLanguages();
	buildLanguages( downloadedLanguages.filter( Boolean ) );
}

run();
