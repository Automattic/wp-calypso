const _ = require( 'lodash' );
const fs = require( 'fs' );
const glob = require( 'glob' );
const path = require( 'path' );
const https = require( 'https' );
const mkdirp = require( 'mkdirp' );
const readline = require( 'readline' );
const parse = require( 'gettext-parser' ).po.parse;

const LANGUAGES_BASE_URL = 'https://widgets.wp.com/languages/calypso';
const LANGUAGES_REVISIONS_FILENAME = 'lang-revisions.json';
const CALYPSO_STRINGS = './calypso-strings.pot';
const CHUNKS_MAP_PATTERN = './chunks-map.*.json';
const LANGUAGE_MANIFEST_FILENAME = 'language-manifest.json';

const languages = [
	'am',
	'ast',
	'gu',
	'hi',
	'hr',
	'hu',
	'he',
	'af',
	'as',
	'ar',
	'da',
	'gd',
	'cy',
	'cs',
	'de_formal',
	'de',
	'bel',
	'bo',
	'br',
	'es-cl',
	'eo',
	'dv',
	'bn',
	'sl',
	'eu',
	'az',
	'bg',
	'el',
	'en-gb',
	'snd',
	'es',
	'fi',
	'skr',
	'el-po',
	'sk',
	'id',
	'fo',
	'so',
	'fr-be',
	'gl',
	'te',
	'es-mx',
	'ms',
	'hy',
	'et',
	'fa',
	'fr',
	'ml',
	'mr',
	'si',
	'mn',
	'oci',
	'ps',
	'fr-ch',
	'sq',
	'bs',
	'ca',
	'zh-tw',
	'ro',
	'pa',
	'fr-ca',
	'su',
	'sr',
	'sv',
	'mwl',
	'ckb',
	'kk',
	'kn',
	'ne',
	'ka',
	'km',
	'tir',
	'lo',
	'no',
	'kir',
	'mk',
	'sr_latin',
	'ta',
	'ko',
	'nl',
	'zh-cn',
	'nn',
	'lv',
	'ga',
	'lt',
	'pl',
	'pt',
	'ru',
	'rup',
	'yi',
	'pt-br',
	'ug',
	'uz',
	'vi',
	'is',
	'ur',
	'uk',
	'it',
	'ja',
	'tl',
	'th',
	'tr',
]; // todo: can we use `../client/languages`?

const chunksMaps = glob.sync( CHUNKS_MAP_PATTERN );
const languagesPaths = chunksMaps
	.map( chunksMapPath => {
		const [ , extraPath ] = path.basename( chunksMapPath ).match( /.+\.(\w+)\.json/, '' );

		if ( ! extraPath ) {
			return;
		}

		return {
			chunksMapPath,
			extraPath,
			publicPath: `./public/${ extraPath }/languages`,
		};
	} )
	.filter( Boolean );

function logUpdate( text ) {
	readline.clearLine( process.stdout, 0 );
	readline.cursorTo( process.stdout, 0 );
	process.stdout.write( text );
}

// Create languages directory
function createLanguagesDir() {
	return languagesPaths.forEach( ( { publicPath } ) => mkdirp.sync( publicPath ) );
}

// Download languages revisions
function downloadLanguagesRevions() {
	return new Promise( resolve => {
		function log( status ) {
			logUpdate(
				`Downloading ${ LANGUAGES_REVISIONS_FILENAME }${ status ? ` ${ status }.` : '...' }`
			);
		}

		const files = languagesPaths.map( ( { publicPath } ) =>
			fs.createWriteStream( `${ publicPath }/${ LANGUAGES_REVISIONS_FILENAME }` )
		);

		https.get( `${ LANGUAGES_BASE_URL }/${ LANGUAGES_REVISIONS_FILENAME }`, response => {
			files.forEach( file => response.pipe( file ) );
			response.on( 'end', () => {
				if ( response.statusCode !== 200 ) {
					log( 'failed' );
					resolve( false );
					return;
				}

				log( 'completed' );
				resolve( true );
			} );
		} );
	} );
}

// Request and write language files
async function downloadLanguages() {
	let downloadedLanguagesCount = 0;

	function log( status ) {
		logUpdate(
			`Downloading languages${ status ? ` ${ status }.` : '...' } ` +
				`(${ downloadedLanguagesCount }/${ languages.length })`
		);
	}

	log();

	const downloadedLanguages = await Promise.all(
		languages.map(
			langSlug =>
				new Promise( resolve => {
					const filename = `${ langSlug }-v1.1.json`;
					const files = languagesPaths.map( ( { publicPath } ) =>
						fs.createWriteStream( `${ publicPath }/${ filename }` )
					);
					const translationUrl = `${ LANGUAGES_BASE_URL }/${ filename }`;

					https.get( translationUrl, response => {
						let body = '';

						files.forEach( file => response.pipe( file ) );
						response.on( 'data', chunk => ( body += chunk ) );
						response.on( 'end', () => {
							if ( response.statusCode === 200 ) {
								downloadedLanguagesCount++;
								log();
							}

							resolve( {
								langSlug,
								languageTranslations: JSON.parse( body ),
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
function buildLanguageChunks( downloadedLanguages ) {
	logUpdate( 'Building language chunks...' );

	if ( fs.existsSync( CALYPSO_STRINGS ) ) {
		const { translations } = parse( fs.readFileSync( CALYPSO_STRINGS ) );
		const translationsFlatten = _.reduce(
			translations,
			( result, contextTranslations, context ) => {
				const mappedTranslations = context
					? _.mapKeys(
							contextTranslations,
							( value, key ) => context + String.fromCharCode( 4 ) + key
					  )
					: contextTranslations;

				return _.merge( result, mappedTranslations );
			},
			{}
		);

		languagesPaths.map( ( { chunksMapPath, publicPath } ) => {
			const chunksMap = require( path.join( '..', chunksMapPath ) );
			const chunks = _.mapValues( chunksMap, modules => {
				return _.chain( translationsFlatten )
					.pickBy( ( { comments } ) =>
						modules.some( module => ( comments.reference || '' ).includes( module ) )
					)
					.keys()
					.value();
			} );

			downloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
				const languageChunks = _.chain( chunks )
					.mapValues( stringIds => _.pick( languageTranslations, stringIds ) )
					.omitBy( _.isEmpty )
					.value();

				// Write language translated chunks map
				const languageChunksDir = path.join( publicPath, langSlug );
				const translatedChunksKeys = Object.keys( languageChunks ).map(
					chunk => path.parse( chunk ).name
				);
				mkdirp.sync( languageChunksDir );
				fs.writeFileSync(
					path.join( languageChunksDir, LANGUAGE_MANIFEST_FILENAME ),
					JSON.stringify( {
						locale: _.pick( languageTranslations, [ '' ] ),
						translatedChunks: translatedChunksKeys,
					} )
				);

				// Write language translation chunks
				_.forEach( languageChunks, ( chunkTranslations, chunkId ) => {
					const chunkFilename = path.basename( chunkId, path.extname( chunkId ) ) + '.json';
					const chunkFilepath = path.join( languageChunksDir, chunkFilename );

					fs.writeFileSync( chunkFilepath, JSON.stringify( chunkTranslations ) );
				} );
			} );
		} );
	}

	logUpdate( 'Building language chunks completed.\n' );
}

async function run() {
	createLanguagesDir();
	await downloadLanguagesRevions();
	const downloadedLanguages = await downloadLanguages();
	buildLanguageChunks( downloadedLanguages );
}

run();
