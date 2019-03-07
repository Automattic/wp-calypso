/** @format */

const { getViewerData, readStatsFromFile } = require( 'webpack-bundle-analyzer/lib/analyzer' );
const { statSync, writeFileSync } = require( 'fs' );
const gzip = require( 'gzip-size' );

analyzeBundle();

function analyzeBundle() {
	console.log( 'Analyze: reading stats.json file' );
	const stats = readStatsFromFile( 'stats.json' );
	console.log( 'Analyze: analyzing' );
	const chart = getViewerData( stats, './public' );
	console.log( 'Analyze: writing chart.json file' );
	writeFileSync( 'chart.json', JSON.stringify( chart, null, 2 ) );
	console.log( 'Analyze: analyzing the style.css file' );
	analyzeStylesheet( './public/style.css', 'style.json' );
	console.log( 'Analyze: finished' );
}

function analyzeStylesheet( inputCSSFile, outputJSONFile ) {
	const parsedSize = statSync( inputCSSFile ).size;
	const gzipSize = gzip.fileSync( inputCSSFile );
	const styleStats = { statSize: parsedSize, parsedSize, gzipSize };
	writeFileSync( outputJSONFile, JSON.stringify( styleStats, null, 2 ) );
}
