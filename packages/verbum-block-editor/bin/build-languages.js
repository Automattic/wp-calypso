/**
 * Build a single language file for each language to `dist/languages` folder.
 */

const fs = require( 'fs' );
const resolve = require( 'path' ).resolve;
const languages = require( '@automattic/languages' );

const outputPath = './dist/languages';
const bundleFile = './dist/block-editor.min.js';

fs.mkdirSync( outputPath, { recursive: true } );

const bundleContents = fs.readFileSync( bundleFile, 'utf8' ).toString();

const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );
// Language slugs without translation
const ignoreLangSlugs = [
	'als',
	'arc',
	'av',
	'ay',
	'bm',
	'ce',
	'csb',
	'cv',
	'de_formal',
	'dz',
	'el-po',
	'en',
	'fr-ch',
	'gn',
	'ia',
	'ii',
	'ilo',
	'kal',
	'ks',
	'kv',
	'mt',
	'mwl',
	'nah',
	'nap',
	'nds',
	'nl_formal',
	'non',
	'nv',
	'or',
	'qu',
	'rup',
	'sc',
	'sr_latin',
	'ty',
	'udm',
	'uk',
	'wa',
	'xal',
	'yi',
	'yo',
	'za',
];

const languagesUrlPattern =
	'https://translate.wordpress.org/projects/wp-plugins/gutenberg/stable/<languageSlug>/default/export-translations/?format=jed1x';

async function fetchLanguage( langSlug ) {
	const translationUrl = languagesUrlPattern.replace( '<languageSlug>', langSlug );

	const response = await fetch( translationUrl );
	if ( response.status !== 200 ) {
		console.error( `VBE: Failed to download language build for ${ langSlug }` );
		return null;
	}

	const json = await response.json();
	return { langSlug, languageTranslations: json };
}

async function downloadLanguages() {
	// Use lower batch size in case of download errors
	const batchSize = 5;
	const remaining = langSlugs.filter( ( v ) => ! ignoreLangSlugs.includes( v ) );

	const responses = [];

	while ( remaining.length !== 0 ) {
		const batch = remaining.splice( 0, batchSize );
		const [ batchResponses ] = await Promise.all( [
			Promise.all( batch.map( ( slug ) => fetchLanguage( slug ) ) ),
			// eslint-disable-next-line no-shadow
			new Promise( ( resolve ) => {
				setTimeout( resolve, 1000 );
			} ),
		] );

		responses.push( ...batchResponses );
	}

	return responses;
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
