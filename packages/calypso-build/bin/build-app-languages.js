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
const { hideBin } = require( 'yargs/helpers' );
const yargs = require( 'yargs/yargs' );

/**
 * Wraps translations with the code needed to inject them in a WP context. This allows us to enqueue the translations via HTTPS (not via filesystem).
 * @param {Object} translations the translations object.
 * @param {string} domain the textdomain. Defauts to 'default'.
 * @returns {string} the wrapped translations.
 */
function wrapWithJS( translations, domain = 'default' ) {
	return `( function( domain, translations ) {
	const { localeData } = translations;
	localeData[""].domain = domain;
	wp.i18n.setLocaleData( localeData, domain );
} )( "${ domain }", { localeData: ${ JSON.stringify( translations ) } } )`;
}

// Configure command-line options
const argv = yargs( hideBin( process.argv ) )
	.option( 'languagesBaseUrl', {
		describe: 'Base URL for the languages endpoint',
		type: 'string',
		default: 'https://widgets.wp.com/languages/calypso',
	} )
	.option( 'languagesRevisionsFilename', {
		describe: 'Filename for the language revisions JSON file',
		type: 'string',
		default: 'lang-revisions.json',
	} )
	.option( 'stringsFilePath', {
		describe: 'Path to the Calypso strings POT file',
		type: 'string',
		requiresArg: true,
	} )
	.option( 'chunksMapPattern', {
		describe: 'Path to the chunks map JSON file',
		type: 'string',
		default: './dist/chunks-map.json',
	} )
	.option( 'stringsPath', {
		describe: 'Path to store string files',
		type: 'string',
		default: './dist/strings',
	} )
	.option( 'outputPath', {
		describe: 'Output path for the built language files',
		type: 'string',
		default: './dist/languages',
	} )
	.option( 'outputFormat', {
		describe: 'Output format for the built language files',
		type: 'string',
		default: 'JSON',
	} )
	.option( 'verbose', {
		describe: 'Enable verbose logging',
		type: 'boolean',
		default: false,
	} )
	.help()
	.alias( 'help', 'h' ).argv;

const {
	languagesBaseUrl,
	languagesRevisionsFilename,
	stringsFilePath,
	chunksMapPattern,
	stringsPath,
	outputFormat,
	outputPath,
	verbose,
} = argv;

fs.mkdirSync( outputPath, { recursive: true } );

const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );

const DECIMAL_POINT_KEY = 'number_format_decimals';
const DECIMAL_POINT_TRANSLATION = 'number_format_decimal_point';
const THOUSANDS_SEPARATOR_KEY = 'number_format_thousands_sep';
const THOUSANDS_SEPARATOR_TRANSLATION = 'number_format_thousands_sep';

// Get module reference
function getModuleReference( ref ) {
	// References need to be relative to the root of the project
	ref = ref.replace( /^\.\.\/\.\.\//, '' );

	// Rewrite ref from `packages/` to match references in POT
	if ( ref.indexOf( 'packages/' ) === 0 ) {
		return ref.replace( '/dist/esm/', '/src/' ).replace( /\.\w+/, '' );
	}

	return ref;
}

function cleanUp() {
	if ( verbose ) {
		console.log( `Cleaning up...` );
	}
	fs.rmSync( stringsPath, { recursive: true, force: true } );
	fs.unlinkSync( stringsFilePath );
}

// Download languages revisions
async function downloadLanguagesRevions() {
	if ( verbose ) {
		console.log( `Downloading ${ languagesRevisionsFilename }...` );
	}
	const response = await fetch( `${ languagesBaseUrl }/${ languagesRevisionsFilename }` );
	if ( response.status !== 200 ) {
		throw new Error( 'Failed to download language revisions file.' );
	}

	const json = await response.json();

	if ( verbose ) {
		console.log( `Downloading ${ languagesRevisionsFilename } completed.` );
	}
	return json;
}

// Request and write language files
async function downloadLanguages( languageRevisions ) {
	return await Promise.all(
		langSlugs.map( async ( langSlug ) => {
			const filename = `${ langSlug }-v1.1.json`;

			const translationUrl = `${ languagesBaseUrl }/${ filename }`;

			if ( verbose ) {
				console.log( `Downloading ${ filename }...` );
			}

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
			if ( verbose ) {
				console.log( `Downloading ${ filename } complete.` );
			}

			return { langSlug, languageTranslations: json };
		} )
	);
}

// Split language translations
function buildLanguages( downloadedLanguages, languageRevisions ) {
	if ( verbose ) {
		console.log( 'Building languages...' );
	}

	const successfullyDownloadedLanguages = downloadedLanguages.filter( ( { failed } ) => ! failed );
	const unsuccessfullyDownloadedLanguages = downloadedLanguages.filter( ( { failed } ) => failed );

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

		const translationsByRef = Object.keys( translationsFlatten ).reduce( ( acc, key ) => {
			const originalRef = translationsFlatten[ key ].comments?.reference;

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

		const chunksMap = require( resolve( process.cwd(), chunksMapPattern ) );

		// Get only the strings that are relevant to the modules for the app
		const allModulesReferences = Object.values( chunksMap ).flat();
		const allModulesStrings = [
			...new Set(
				allModulesReferences
					.map( ( modulePath ) => {
						modulePath = getModuleReference( modulePath );
						const key = /\.\w+/.test( modulePath )
							? modulePath
							: Object.keys( translationsByRef ).find( ( ref ) => ref.indexOf( modulePath ) === 0 );

						if ( ! key ) {
							return [];
						}

						return translationsByRef[ key ] || [];
					} )
					.flat()
			),
		];

		const languageRevisionsHashes = {};
		successfullyDownloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
			const cmdPaletteTranslations = _.pick( languageTranslations, allModulesStrings );
			cmdPaletteTranslations[ DECIMAL_POINT_KEY ] =
				languageTranslations[ DECIMAL_POINT_TRANSLATION ];
			cmdPaletteTranslations[ THOUSANDS_SEPARATOR_KEY ] =
				languageTranslations[ THOUSANDS_SEPARATOR_TRANSLATION ];
			cmdPaletteTranslations[ '' ] = languageTranslations[ '' ];

			if ( outputFormat === 'JSON' ) {
				const output = resolve( process.cwd(), outputPath, `${ langSlug }-v1.1.json` );
				if ( verbose ) {
					console.log( `Writing ${ output }...` );
				}
				fs.writeFileSync( output, JSON.stringify( cmdPaletteTranslations ) );
			} else if ( outputFormat === 'JS' ) {
				const output = resolve( process.cwd(), outputPath, `${ langSlug }-v1.js` );
				if ( verbose ) {
					console.log( `Writing ${ output }...` );
				}
				fs.writeFileSync( output, wrapWithJS( cmdPaletteTranslations ) );
			} else {
				console.error( 'Invalid output format' );
				process.exit( 1 );
			}
		} );

		if ( verbose ) {
			console.log( 'Updating language revisions...' );
		}

		fs.writeFileSync(
			resolve( process.cwd(), `${ outputPath }/${ languagesRevisionsFilename }` ),
			JSON.stringify( {
				...languageRevisions,
				hashes: languageRevisionsHashes,
			} )
		);
	} else {
		console.error( `${ stringsFilePath } is missing` );
	}

	console.info( '✅ Language build completed.' );

	if ( verbose ) {
		console.log(
			`Skipped due to failed translation downloads: ${ unsuccessfullyDownloadedLanguages
				.map( ( { langSlug } ) => langSlug )
				.join( ', ' ) }.`
		);
	}
}

async function run() {
	console.info( 'ℹ️ Starting language build...' );
	const languageRevisions = await downloadLanguagesRevions();
	const downloadedLanguages = await downloadLanguages( languageRevisions );
	buildLanguages( downloadedLanguages, languageRevisions );
	cleanUp();
}

run();
