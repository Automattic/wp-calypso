const _ = require( 'lodash' );
const fs = require( 'fs' );
const path = require( 'path' );
const https = require( 'https' );
const mkdirp = require( 'mkdirp' );
const parse = require( 'gettext-parser' ).po.parse;

const LANGUAGES_BASE_URL = 'https://widgets.wp.com/languages/calypso';
const LANGUAGES_DIR = './public/evergreen/languages';

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

// Create languages directory
mkdirp.sync( LANGUAGES_DIR );

// Request and write language files
const languagesRequests = Promise.all(
	languages.map(
		langSlug =>
			new Promise( resolve => {
				const filename = `${ langSlug }-v1.1.json`;
				const file = fs.createWriteStream( `${ LANGUAGES_DIR }/${ filename }` );
				const translationUrl = `${ LANGUAGES_BASE_URL }/${ filename }`;

				https.get( translationUrl, response => {
					let body = '';

					response.pipe( file );
					response.on( 'data', chunk => ( body += chunk ) );
					response.on( 'end', () => {
						if ( response.statusCode !== 200 ) {
							console.log( `failed to download: ${ translationUrl }` );
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

languagesRequests.then( downloadedLanguages => {
	console.log( 'Downloading translations completed.' );

	// Split language translations into chunks
	const CALYPSO_STRINGS = './calypso-strings.pot';
	const CHUNKS_MAP = './chunks-map.json';
	const TRANSLATED_CHUNKS_FILENAME = 'translated-chunks.json';

	if ( fs.existsSync( CALYPSO_STRINGS ) && fs.existsSync( CHUNKS_MAP ) ) {
		const chunksMap = require( '../chunks-map.json' );
		const translations = parse( fs.readFileSync( CALYPSO_STRINGS ) ).translations[ '' ];
		const translationsValues = Object.values( translations );

		const chunks = _.mapValues( chunksMap, modules => {
			return translationsValues
				.filter( ( { comments } ) =>
					modules.some( module => ( comments.reference || '' ).includes( module ) )
				)
				.map( ( { msgid } ) => msgid );
		} );

		downloadedLanguages.forEach( ( { langSlug, languageTranslations } ) => {
			const languageChunks = _.chain( chunks )
				.mapValues( stringIds => _.pick( languageTranslations, stringIds ) )
				.omitBy( _.isEmpty )
				.value();

			// Write language translated chunks map
			const languageChunksDir = path.join( LANGUAGES_DIR, langSlug );
			const translatedChunksKeys = Object.keys( languageChunks ).map(
				chunk => path.parse( chunk ).name
			);
			mkdirp.sync( languageChunksDir );
			fs.writeFileSync(
				path.join( languageChunksDir, TRANSLATED_CHUNKS_FILENAME ),
				JSON.stringify( translatedChunksKeys )
			);

			// Write laguage translation chunks
			_.forEach( languageChunks, ( chunkTranslations, chunkId ) => {
				const chunkFilename = path.basename( chunkId, path.extname( chunkId ) ) + '.json';
				const chunkFilepath = path.join( languageChunksDir, chunkFilename );

				fs.writeFileSync( chunkFilepath, JSON.stringify( chunkTranslations ) );
			} );
		} );
	}

	console.log( 'Write language chunks completed.' );
} );
