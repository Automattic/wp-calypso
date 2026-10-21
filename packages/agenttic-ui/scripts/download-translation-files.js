#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );
const projectRoot = join( __dirname, '..' );

// GlotPress configuration
const GLOTPRESS_PROJECT = 'wpcom/agenttic';
const GLOTPRESS_SLUG = 'default';
const GLOTPRESS_FORMAT = 'jed1x';
const GLOTPRESS_BASE_URL = 'https://translate.wordpress.com/projects';
const GLOTPRESS_API_URL = 'https://translate.wordpress.com/api/projects';

/**
 * Fetch the locales the GlotPress project has a translation set for.
 * Runs on every install, so an unreachable API skips translations instead of failing it.
 * @returns {Promise<string[]>} GlotPress locale slugs, e.g. `de`, `pt-br`
 */
async function fetchAvailableLocales() {
	try {
		const response = await fetch( `${ GLOTPRESS_API_URL }/${ GLOTPRESS_PROJECT }` );

		if ( ! response.ok ) {
			throw new Error( `HTTP ${ response.status }` );
		}

		const { translation_sets: translationSets = [] } = await response.json();

		return translationSets
			.filter( ( set ) => set.slug === GLOTPRESS_SLUG )
			.map( ( set ) => set.locale );
	} catch ( error ) {
		console.warn( `⚠️  Could not fetch available locales from GlotPress -`, error.message );
		return [];
	}
}

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
		( file ) => file.endsWith( '.jed.json' ) && file.startsWith( 'wpcom-agenttic-' )
	);

	existingJsonFiles.forEach( ( file ) => {
		const filePath = join( languagesDir, file );
		unlinkSync( filePath );
		console.log( `   Removed: ${ file }` );
	} );

	if ( existingJsonFiles.length > 0 ) {
		console.log( `✅ Removed ${ existingJsonFiles.length } existing Jed JSON files\n` );
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
			console.warn( `⚠️  ${ locale }: Translation not available (${ response.status })` );
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
			`✅ ${ locale }: Downloaded ${ filename } (${ JSON.stringify( jsonData ).length } chars)`
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
	console.log( '🌍 Downloading Jed JSON translation files from GlotPress...\n' );

	const locales = await fetchAvailableLocales();

	if ( locales.length === 0 ) {
		return;
	}

	cleanupExistingJsonFiles();

	const totalCount = locales.length;

	const results = await Promise.all( locales.map( downloadJsonFile ) );
	const successCount = results.filter( Boolean ).length;

	console.log( `\n📊 Download Summary:` );
	console.log( `✅ Successfully downloaded: ${ successCount }/${ totalCount } files` );
	console.log( `⚠️  Skipped/failed: ${ totalCount - successCount } files` );

	if ( successCount > 0 ) {
		console.log( `\n🎉 Jed JSON files are ready in the languages/ folder!` );
	} else {
		console.log(
			`\n⚠️  No Jed JSON files were downloaded. Check network connection or GlotPress availability.`
		);
	}
}

downloadAllJsonFiles();
