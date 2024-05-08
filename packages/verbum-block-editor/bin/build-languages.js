/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */
/**
 * Downloads Gutenberg translations from translate.wordpress.org and creates language files.
 */

const fs = require( 'fs' );
const resolve = require( 'path' ).resolve;
const languages = require( '@automattic/languages' );
const fetch = require( 'node-fetch' );

const langSlugs = languages.default.map( ( { langSlug } ) => langSlug );

const languagesUrlPattern =
	'https://translate.wordpress.org/projects/wp-plugins/gutenberg/stable/<languageSlug>/default/export-translations/?format=jed1x';

fs.mkdirSync( './dist/languages', { recursive: true } );

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

async function run() {
	console.info( 'Starting language build...' );
	const downloadedLanguages = await downloadLanguages();
	downloadedLanguages.filter( Boolean ).forEach( ( { langSlug, languageTranslations } ) => {
		const translationFile = languageTranslations.locale_data.messages; //_.pick( languageTranslations.locale_data.messages, allStrings );
		translationFile[ '' ].localeSlug = langSlug;
		const output = resolve(
			process.cwd(),
			'dist',
			'languages',
			`${ translationFile[ '' ].lang }-v1.1.json`
		);
		fs.writeFileSync( output, JSON.stringify( translationFile ) );
	} );
}

run();
