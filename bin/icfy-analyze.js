/** @format */

const { getViewerData, readStatsFromFile } = require( 'webpack-bundle-analyzer/lib/analyzer' );
const { existsSync, statSync, readFileSync, writeFileSync } = require( 'fs' );
const { createHash } = require( 'crypto' );
const gzip = require( 'gzip-size' );

analyzeBundle();

function analyzeBundle() {
	console.log( 'Analyze: reading stats.json file' );
	const stats = readStatsFromFile( 'stats.json' );
	console.log( 'Analyze: analyzing' );
	const chart = getViewerData( stats, './public/evergreen' );
	console.log( 'Analyze: writing chart.json file' );
	writeFileSync( 'chart.json', JSON.stringify( chart, null, 2 ) );
	console.log( 'Analyze: analyzing the style.css file' );
	analyzeStylesheet( './public/style.css', 'style.json' );
	console.log( 'Analyze: finished' );
}

function hashFile( inputFile ) {
	const sha = createHash( 'sha1' );
	const data = readFileSync( inputFile );
	sha.update( data );
	return sha.digest( 'hex' ).slice( 0, 20 );
}

function analyzeStylesheet( inputCSSFile, outputJSONFile ) {
	if ( ! existsSync( inputCSSFile ) ) {
		return;
	}
	const parsedSize = statSync( inputCSSFile ).size;
	const gzipSize = gzip.fileSync( inputCSSFile );
	const hash = hashFile( inputCSSFile );
	const styleStats = { statSize: parsedSize, parsedSize, gzipSize, hash };
	writeFileSync( outputJSONFile, JSON.stringify( styleStats, null, 2 ) );
}
