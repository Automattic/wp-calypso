/** @format */

const { getViewerData, readStatsFromFile } = require( 'webpack-bundle-analyzer/lib/analyzer' );
const { writeFileSync } = require( 'fs' );

analyzeBundle();

function analyzeBundle() {
	console.log( 'Analyze: reading stats.json file' );
	const stats = readStatsFromFile( 'stats.json' );
	console.log( 'Analyze: analyzing' );
	const chart = getViewerData( stats, './public' );
	console.log( 'Analyze: writing chart.json file' );
	writeFileSync( 'chart.json', JSON.stringify( chart, null, 2 ) );
	console.log( 'Analyze: finished' );
}
