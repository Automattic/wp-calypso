const crypto = require( 'crypto' );
const fs = require( 'fs' );
const https = require( 'https' );
const path = require( 'path' );
const readline = require( 'readline' );
const languages = require( '@automattic/languages' );
const parse = require( 'gettext-parser' ).po.parse;
const _ = require( 'lodash' );
const mkdirp = require( 'mkdirp' );

const LANGUAGES_BASE_URL = 'https://widgets.wp.com/languages/calypso';
const LANGUAGES_REVISIONS_FILENAME = 'lang-revisions.json';
const CALYPSO_STRINGS = './public/calypso-strings.pot';
const CHUNKS_MAP_PATTERN = './public/chunks-map.json';
const LANGUAGE_MANIFEST_FILENAME = 'language-manifest.json';
const OUTPUT_PATH = './public/languages';
const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );

function logUpdate( text ) {
	readline.clearLine( process.stdout, 0 );
	readline.cursorTo( process.stdout, 0 );
	process.stdout.write( text );
}

// Create languages directory
function createLanguagesDir() {
	return mkdirp.sync( OUTPUT_PATH );
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
function downloadLanguagesRevions() {
	return new Promise( ( resolve ) => {
		function log( status ) {
			logUpdate(
				`Downloading ${ LANGUAGES_REVISIONS_FILENAME }${ status ? ` ${ status }.` : '...' }`
			);
		}

		const fileStream = fs.createWriteStream( `${ OUTPUT_PATH }/${ LANGUAGES_REVISIONS_FILENAME }` );

		https.get( `${ LANGUAGES_BASE_URL }/${ LANGUAGES_REVISIONS_FILENAME }`, ( response ) => {
			response.pipe( fileStream );

			let languageRevisions = '';
			response.on( 'data', ( chunk ) => {
				languageRevisions += chunk;
			} );
			response.on( 'end', () => {
				if ( response.statusCode !== 200 ) {
					console.error( 'Failed to download language revisions file.' );
					process.exit( 1 );
				}

				log( 'completed' );
				resolve( JSON.parse( languageRevisions ) );
			} );
		} );
	} );
}

// Request and write language files
async function downloadLanguages( languageRevisions ) {
	let downloadedLanguagesCount = 0;

	function log( status ) {
		logUpdate(
			`Downloading languages${ status ? ` ${ status }.` : '...' } ` +
				`(${ downloadedLanguagesCount }/${ langSlugs.length })`
		);
	}

	log();

	const downloadedLanguages = await Promise.all(
		langSlugs.map(
			( langSlug ) =>
				new Promise( ( resolve ) => {
					const filename = `${ langSlug }-v1.1.json`;

					const fileStream = fs.createWriteStream( `${ OUTPUT_PATH }/${ filename }` );
					const translationUrl = `${ LANGUAGES_BASE_URL }/${ filename }`;

					https.get( translationUrl, ( response ) => {
						response.setEncoding( 'utf8' );
						let body = '';

						response.pipe( fileStream );
						response.on( 'data', ( chunk ) => ( body += chunk ) );
						response.on( 'end', () => {
							// Script should exit with an error if any of the
							// translation download jobs for a language included
							// in language revisions file fails.
							// Failed downloads for languages that are not
							// included in language revisions file could be skipped
							// without interrupting the script.
							if ( response.statusCode !== 200 && langSlug in languageRevisions ) {
								console.error( `Failed to download translations for "${ langSlug }".` );
								process.exit( 1 );
							}

							if ( response.statusCode === 200 ) {
								downloadedLanguagesCount++;
								log();

								resolve( {
									langSlug,
									languageTranslations: JSON.parse( body ),
								} );

								return;
							}

							resolve( {
								langSlug,
								failed: true,
							} );
						} );
					} );
				} )
		)
	);

	log( 'completed' );

	return downloadedLanguages;
}

// Split language translations into chunks
function buildLanguageChunks( downloadedLanguages, languageRevisions ) {
	logUpdate( 'Building language chunks...' );

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
					: Object.keys( translationsByRef ).find( ( ref ) => ref.indexOf( modulePath ) === 0 );

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
				locale: _.pick( languageTranslations, [ '' ] ),
				translatedChunks: translatedChunksKeys,
			};
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

		logUpdate( 'Updating language revisions...\n' );

		return fs.writeFileSync(
			`${ OUTPUT_PATH }/${ LANGUAGES_REVISIONS_FILENAME }`,
			JSON.stringify( {
				...languageRevisions,
				hashes: languageRevisionsHashes,
			} )
		);
	}

	logUpdate(
		`Building language chunks completed.\nSkipped due to failed translation downloads: ${ unsuccessfullyDownloadedLanguages
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
