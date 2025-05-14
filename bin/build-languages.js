const crypto = require( 'crypto' );
const fs = require( 'fs' );
const { writeFile } = require( 'fs' ).promises;
const path = require( 'path' );
const languages = require( '@automattic/languages' );
const parse = require( 'gettext-parser' ).po.parse;
const _ = require( 'lodash' );

const LANGUAGES_BASE_URL = 'https://widgets.wp.com/languages/calypso';
const LANGUAGES_REVISIONS_FILENAME = 'lang-revisions.json';
const CALYPSO_STRINGS = './public/calypso-strings.pot';
const CHUNKS_MAP_PATTERN = './public/chunks-map.json';
const LANGUAGE_MANIFEST_FILENAME = 'language-manifest.json';
const OUTPUT_PATH = './public/languages';
const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );

const CONFIG_BLOCK_KEY = '';
const DECIMAL_POINT_KEY = 'number_format_decimals';
const DECIMAL_POINT_TRANSLATION = 'number_format_decimal_point';
const THOUSANDS_SEPARATOR_KEY = 'number_format_thousands_sep';
const THOUSANDS_SEPARATOR_TRANSLATION = 'number_format_thousands_sep';

// Create languages directory
function createLanguagesDir() {
	return fs.mkdirSync( OUTPUT_PATH, { recursive: true } );
}

// Get module reference
function getModuleReference( module ) {
	// Rewrite module from `packages/` to match references in POT
	if ( module.indexOf( 'packages/' ) === 0 ) {
		return module.replace( '/dist/esm/', '/src/' ).replace( /\.\w+/, '' );
	}

	return module;
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
		`${ OUTPUT_PATH }/${ LANGUAGES_REVISIONS_FILENAME }`,
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

			const output = `${ OUTPUT_PATH }/${ filename }`;
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

// Split language translations into chunks
function buildLanguageChunks( downloadedLanguages, languageRevisions ) {
	console.log( 'Building language chunks...' );

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

		const languageRevisionsHashes = {};
		// CHUNKS_MAP_PATTERN is relative to the project root, while require is relative to current dir. Hence the `../`
		const chunksMap = require( '../' + CHUNKS_MAP_PATTERN );

		const chunks = _.mapValues( chunksMap, ( modules ) => {
			const strings = new Set();

			modules.forEach( ( modulePath ) => {
				modulePath = getModuleReference( modulePath );
				const key = /\.\w+/.test( modulePath )
					? modulePath
					: Object.keys( translationsByRef ).find(
							( ref ) => ref.indexOf( modulePath + '.' ) === 0
					  );

				if ( ! key ) {
					return;
				}

				const stringsFromModule = translationsByRef[ key ] || [];
				stringsFromModule.forEach( ( string ) => strings.add( string ) );
			} );

			return [ ...strings ];
		} );

		successfullyDownloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
			const languageChunks = _.chain( chunks )
				.mapValues( ( stringIds ) => _.pick( languageTranslations, stringIds ) )
				.omitBy( _.isEmpty )
				.value();

			// Write language translated chunks map
			const translatedChunksKeys = Object.keys( languageChunks ).map(
				( chunk ) => path.parse( chunk ).name
			);
			const manifestJsonDataRaw = {
				locale: _.pick( languageTranslations, [ CONFIG_BLOCK_KEY ] ),
				translatedChunks: translatedChunksKeys,
			};
			manifestJsonDataRaw.locale[ DECIMAL_POINT_KEY ] =
				languageTranslations[ DECIMAL_POINT_TRANSLATION ];
			manifestJsonDataRaw.locale[ THOUSANDS_SEPARATOR_KEY ] =
				languageTranslations[ THOUSANDS_SEPARATOR_TRANSLATION ];
			const manifestJsonDataFingerprint = JSON.stringify( manifestJsonDataRaw );

			manifestJsonDataRaw.hash = crypto
				.createHash( 'sha1' )
				.update( manifestJsonDataFingerprint )
				.digest( 'hex' );

			// Trim hash in language revisions to 5 characters to reduce file size
			languageRevisionsHashes[ langSlug ] = manifestJsonDataRaw.hash.substr( 0, 5 );

			const manifestJsonData = JSON.stringify( manifestJsonDataRaw );
			const manifestFilepathJson = path.join(
				OUTPUT_PATH,
				`${ langSlug }-${ LANGUAGE_MANIFEST_FILENAME }`
			);
			fs.writeFileSync( manifestFilepathJson, manifestJsonData );

			const manifestJsData = `var i18nLanguageManifest = ${ manifestJsonData }`;
			const manifestFilepathJs = path.format( {
				...path.parse( manifestFilepathJson ),
				base: null,
				ext: '.js',
			} );
			fs.writeFileSync( manifestFilepathJs, manifestJsData );

			// Write language translation chunks
			_.forEach( languageChunks, ( chunkTranslations, chunkFilename ) => {
				const chunkId = path.basename( chunkFilename, path.extname( chunkFilename ) );
				const chunkJsonData = JSON.stringify( chunkTranslations );
				const chunkJsData = `var i18nTranslationChunks = i18nTranslationChunks || {}; i18nTranslationChunks[${ JSON.stringify(
					chunkId
				) }] = ${ chunkJsonData }`;

				const chunkFilenameJson = chunkId + '.json';
				const chunkFilepathJson = path.join( OUTPUT_PATH, `${ langSlug }-${ chunkFilenameJson }` );
				fs.writeFileSync( chunkFilepathJson, chunkJsonData );

				const chunkFilepathJs = path.format( {
					...path.parse( chunkFilepathJson ),
					base: null,
					ext: '.js',
				} );
				fs.writeFileSync( chunkFilepathJs, chunkJsData );
			} );
		} );

		console.log( 'Updating language revisions...' );

		return fs.writeFileSync(
			`${ OUTPUT_PATH }/${ LANGUAGES_REVISIONS_FILENAME }`,
			JSON.stringify( {
				...languageRevisions,
				hashes: languageRevisionsHashes,
			} )
		);
	}

	console.log( 'Building language chunks completed.' );
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
	buildLanguageChunks( downloadedLanguages, languageRevisions );
}

run();
