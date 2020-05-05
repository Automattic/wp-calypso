const { getViewerData, readStatsFromFile } = require( 'webpack-bundle-analyzer/lib/analyzer' );
const { writeFileSync } = require( 'fs' );

analyzeBundle();

function analyzeBundle() {
	console.log( 'Analyze: reading stats.json file' );
	const stats = readStatsFromFile( 'client/stats.json' );
	console.log( 'Analyze: analyzing' );
	const chart = getViewerData( stats, './public/evergreen' );
	console.log( 'Analyze: writing chart.json file' );
	writeFileSync( 'client/chart.json', JSON.stringify( chart, null, 2 ) );
	console.log( 'Analyze: finished' );
}
