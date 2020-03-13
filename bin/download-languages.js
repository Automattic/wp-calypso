const fs = require( 'fs' );
const https = require( 'https' );
const mkdirp = require( 'mkdirp' );

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
					response.pipe( file );
					response.on( 'end', () => {
						if ( response.statusCode !== 200 ) {
							console.log( `failed to download: ${ translationUrl }` );
						}
						resolve();
					} );
				} );
			} )
	)
);

languagesRequests.then( () => console.log( 'Downloading translations completed.' ) );
