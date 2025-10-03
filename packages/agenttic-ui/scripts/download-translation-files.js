#!/usr/bin/env node

import {
	existsSync,
	mkdirSync,
	readdirSync,
	unlinkSync,
	writeFileSync,
} from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );
const projectRoot = join( __dirname, '..' );

// Supported locales - same as generate-po-files.js
const SUPPORTED_LOCALES = {
	ar: 'Arabic',
	de: 'German',
	de_DE: 'German',
	es: 'Spanish (Spain)',
	es_ES: 'Spanish (Spain)',
	fr: 'French (France)',
	fr_FR: 'French (France)',
	he: 'Hebrew',
	he_IL: 'Hebrew',
	id: 'Indonesian',
	id_ID: 'Indonesian',
	it: 'Italian',
	it_IT: 'Italian',
	ja: 'Japanese',
	ko: 'Korean',
	ko_KR: 'Korean',
	nl: 'Dutch',
	nl_NL: 'Dutch',
	'pt-br': 'Portuguese (Brazil)',
	pt_BR: 'Portuguese (Brazil)',
	ru: 'Russian',
	ru_RU: 'Russian',
	sv: 'Swedish',
	sv_SE: 'Swedish',
	tr: 'Turkish',
	tr_TR: 'Turkish',
	'zh-cn': 'Chinese (China)',
	zh_CN: 'Chinese (China)',
	'zh-tw': 'Chinese (Taiwan)',
	zh_TW: 'Chinese (Taiwan)',
};

// GlotPress configuration
const GLOTPRESS_PROJECT = 'wpcom/agenttic';
const GLOTPRESS_SLUG = 'default';
const GLOTPRESS_FORMAT = 'jed1x';
const GLOTPRESS_BASE_URL = 'https://translate.wordpress.com/projects';

/**
 * Clean up existing Jed JSON files to ensure fresh downloads
 */
function cleanupExistingJsonFiles() {
	const languagesDir = join( projectRoot, 'languages' );

	if ( ! existsSync( languagesDir ) ) {
		return;
	}

	console.log( '🧹 Cleaning up existing Jed JSON files...' );

	const existingJsonFiles = readdirSync( languagesDir ).filter(
		( file ) =>
			file.endsWith( '.jed.json' ) && file.startsWith( 'wpcom-agenttic-' )
	);

	existingJsonFiles.forEach( ( file ) => {
		const filePath = join( languagesDir, file );
		unlinkSync( filePath );
		console.log( `   Removed: ${ file }` );
	} );

	if ( existingJsonFiles.length > 0 ) {
		console.log(
			`✅ Removed ${ existingJsonFiles.length } existing Jed JSON files\n`
		);
	} else {
		console.log( '   No existing Jed JSON files to remove\n' );
	}
}

/**
 * Download Jed JSON file from GlotPress
 * @param {string} locale
 */
async function downloadJsonFile( locale ) {
	try {
		// Use the new URL structure: /projects/{project}/{locale}/{slug}/export-translations?format=jed1x
		const url = `${ GLOTPRESS_BASE_URL }/${ GLOTPRESS_PROJECT }/${ locale }/${ GLOTPRESS_SLUG }/export-translations?format=${ GLOTPRESS_FORMAT }`;

		console.log( `Downloading ${ locale }: ${ url }` );

		const response = await fetch( url );

		if ( ! response.ok ) {
			console.warn(
				`⚠️  ${ locale }: Translation not available (${ response.status })`
			);
			return false;
		}

		const jsonData = await response.json();

		// Save to languages folder
		const languagesDir = join( projectRoot, 'languages' );
		if ( ! existsSync( languagesDir ) ) {
			mkdirSync( languagesDir, { recursive: true } );
		}

		const filename = `wpcom-agenttic-${ locale }.jed.json`;
		const filePath = join( languagesDir, filename );

		writeFileSync( filePath, JSON.stringify( jsonData, null, 2 ) );

		console.log(
			`✅ ${ locale }: Downloaded ${ filename } (${
				JSON.stringify( jsonData ).length
			} chars)`
		);
		return true;
	} catch ( error ) {
		console.error( `❌ ${ locale }: Download failed -`, error.message );
		return false;
	}
}

/**
 * Download all Jed JSON files
 */
async function downloadAllJsonFiles() {
	console.log(
		'🌍 Downloading Jed JSON translation files from GlotPress...\n'
	);

	// Clean up existing files first to ensure fresh downloads
	cleanupExistingJsonFiles();

	const locales = Object.keys( SUPPORTED_LOCALES );
	let successCount = 0;
	const totalCount = locales.length;

	// Download files sequentially to avoid overwhelming the server
	for ( const locale of locales ) {
		const success = await downloadJsonFile( locale );
		if ( success ) {
			successCount++;
		}

		// Small delay between requests
		await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
	}

	console.log( `\n📊 Download Summary:` );
	console.log(
		`✅ Successfully downloaded: ${ successCount }/${ totalCount } files`
	);
	console.log( `⚠️  Skipped/failed: ${ totalCount - successCount } files` );

	if ( successCount > 0 ) {
		console.log(
			`\n🎉 Jed JSON files are ready in the languages/ folder!`
		);
	} else {
		console.log(
			`\n⚠️  No Jed JSON files were downloaded. Check network connection or GlotPress availability.`
		);
	}
}

downloadAllJsonFiles();
