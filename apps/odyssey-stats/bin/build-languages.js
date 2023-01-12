/**
 * Build single language file for each language to the `dist/languages` folder.
 */
const fs = require( 'fs' );
const { writeFile } = require( 'fs' ).promises;
const languages = require( '@automattic/languages' );
const parse = require( 'gettext-parser' ).po.parse;
const _ = require( 'lodash' );
const mkdirp = require( 'mkdirp' );
const fetch = require( 'node-fetch' );

const LANGUAGES_BASE_URL = 'https://widgets.wp.com/languages/calypso';
const LANGUAGES_REVISIONS_FILENAME = 'lang-revisions.json';
const TEMP_PATH = './dist/temp-languages';
const CALYPSO_STRINGS = './dist/odyssey-strings.pot';
const CHUNKS_MAP_PATTERN = './dist/chunks-map.json';
const STRINGS_PATH = './dist/strings';
const OUTPUT_PATH = './dist/languages';
const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );

const DECIMAL_POINT_KEY = 'number_format_decimals';
const DECIMAL_POINT_TRANSLATION = 'number_format_decimal_point';
const THOUSANDS_SEPARATOR_KEY = 'number_format_thousands_sep';
const THOUSANDS_SEPARATOR_TRANSLATION = 'number_format_thousands_sep';

// Create languages directory
function createLanguagesDir() {
	return mkdirp.sync( TEMP_PATH ) && mkdirp.sync( OUTPUT_PATH );
}
// Get module reference
function getModuleReference( module ) {
	// Rewrite module from `packages/` to match references in POT
	if ( module.indexOf( 'packages/' ) === 0 ) {
		return module.replace( '/dist/esm/', '/src/' ).replace( /\.\w+/, '' );
	}

	return module;
}

function cleanUp() {
	console.log( `Cleaning up...` );
	fs.rmSync( TEMP_PATH, { recursive: true, force: true } );
	fs.rmSync( STRINGS_PATH, { recursive: true, force: true } );
	fs.unlinkSync( CHUNKS_MAP_PATTERN );
	fs.unlinkSync( CALYPSO_STRINGS );
}

// Download languages revisions
async function downloadLanguagesRevions() {
	console.log( `Downloading ${ LANGUAGES_REVISIONS_FILENAME }...` );
	const response = await fetch( `${ LANGUAGES_BASE_URL }/${ LANGUAGES_REVISIONS_FILENAME }` );
	if ( response.status !== 200 ) {
		throw new Error( 'Failed to download language revisions file.' );
	}

	const json = await response.json();
	await writeFile(
		`${ TEMP_PATH }/${ LANGUAGES_REVISIONS_FILENAME }`,
		JSON.stringify( json, null, 2 )
	);

	console.log( `Downloading ${ LANGUAGES_REVISIONS_FILENAME } completed.` );
	return json;
}

// Request and write language files
async function downloadLanguages( languageRevisions ) {
	return await Promise.all(
		langSlugs.map( async ( langSlug ) => {
			const filename = `${ langSlug }-v1.1.json`;

			const output = `${ TEMP_PATH }/${ filename }`;
			const translationUrl = `${ LANGUAGES_BASE_URL }/${ filename }`;

			console.log( `Downloading ${ filename }...` );

			const response = await fetch( translationUrl );
			if ( response.status !== 200 ) {
				// Script should exit with an error if any of the
				// translation download jobs for a language included
				// in language revisions file fails.
				// Failed downloads for languages that are not
				// included in language revisions file could be skipped
				// without interrupting the script.
				if ( langSlug in languageRevisions ) {
					throw new Error( `Failed to download translations for "${ langSlug }".` );
				}
				return { langSlug, failed: true };
			}

			const json = await response.json();
			await writeFile( output, JSON.stringify( json ) );

			console.log( `Downloading ${ filename } complete.` );

			return { langSlug, languageTranslations: json };
		} )
	);
}

// Split language translations
function buildLanguages( downloadedLanguages, languageRevisions ) {
	console.log( 'Building languages...' );

	const successfullyDownloadedLanguages = downloadedLanguages.filter( ( { failed } ) => ! failed );
	const unsuccessfullyDownloadedLanguages = downloadedLanguages.filter( ( { failed } ) => failed );

	if ( fs.existsSync( CALYPSO_STRINGS ) ) {
		const { translations } = parse( fs.readFileSync( CALYPSO_STRINGS ) );
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

		const translationsByRef = Object.keys( translationsFlatten ).reduce( ( acc, key ) => {
			const originalRef = translationsFlatten[ key ].comments.reference;

			if ( ! originalRef ) {
				return acc;
			}

			const refs = originalRef.split( '\n' ).map( ( ref ) => ref.replace( /:\d+/, '' ) );

			refs.forEach( ( ref ) => {
				if ( typeof acc[ ref ] === 'undefined' ) {
					acc[ ref ] = [];
				}

				acc[ ref ].push( key );
			} );
			return acc;
		}, {} );

		// CHUNKS_MAP_PATTERN is relative to the project root, while require is relative to current dir. Hence the `../`
		const chunksMap = require( '../' + CHUNKS_MAP_PATTERN );

		// Merge all source references into the main `build.min.js` chunk
		const merged = Object.keys( chunksMap ).reduce( ( acc, key ) => {
			acc[ 'build.min.js' ] = ( acc[ 'build.min.js' ] || [] ).concat(
				// filepaths need to be relative to the root of the project
				chunksMap[ key ].map( ( filepath ) => filepath.replace( /^\.\.\/\.\.\//, '' ) )
			);

			return acc;
		}, {} );

		const chunks = _.mapValues( merged, ( modules ) => {
			const strings = new Set();

			modules.forEach( ( modulePath ) => {
				modulePath = getModuleReference( modulePath );
				const key = /\.\w+/.test( modulePath )
					? modulePath
					: Object.keys( translationsByRef ).find( ( ref ) => ref.indexOf( modulePath ) === 0 );

				if ( ! key ) {
					return;
				}

				const stringsFromModule = translationsByRef[ key ] || [];
				stringsFromModule.forEach( ( string ) => strings.add( string ) );
			} );

			return [ ...strings ];
		} );

		const languageRevisionsHashes = {};
		successfullyDownloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
			const odysseyLanguageTranslations = _.pick( languageTranslations, chunks[ 'build.min.js' ] );
			odysseyLanguageTranslations[ DECIMAL_POINT_KEY ] =
				languageTranslations[ DECIMAL_POINT_TRANSLATION ];
			odysseyLanguageTranslations[ THOUSANDS_SEPARATOR_KEY ] =
				languageTranslations[ THOUSANDS_SEPARATOR_TRANSLATION ];
			odysseyLanguageTranslations[ '' ] = languageTranslations[ '' ];

			const output = `${ OUTPUT_PATH }/${ langSlug }-v1.1.json`;
			console.log( `Writing ${ output }...` );
			fs.writeFileSync( output, JSON.stringify( odysseyLanguageTranslations ) );
		} );

		console.log( 'Updating language revisions...' );

		fs.writeFileSync(
			`${ OUTPUT_PATH }/${ LANGUAGES_REVISIONS_FILENAME }`,
			JSON.stringify( {
				...languageRevisions,
				hashes: languageRevisionsHashes,
			} )
		);

		cleanUp();
	} else {
		console.error( `${ CALYPSO_STRINGS } is missing` );
	}

	console.log( 'Building language completed.' );
	console.log(
		`Skipped due to failed translation downloads: ${ unsuccessfullyDownloadedLanguages
			.map( ( { langSlug } ) => langSlug )
			.join( ', ' ) }.`
	);
}

async function run() {
	createLanguagesDir();
	const languageRevisions = await downloadLanguagesRevions();
	const downloadedLanguages = await downloadLanguages( languageRevisions );
	buildLanguages( downloadedLanguages, languageRevisions );
}

run();
