const { writeFileSync } = require( 'fs' );
const { getViewerData, readStatsFromFile } = require( 'webpack-bundle-analyzer/lib/analyzer' );

analyzeBundle();

async function analyzeBundle() {
	console.log( 'Analyze: reading stats.json file' );
	const stats = await readStatsFromFile( 'client/stats.json' );
	console.log( 'Analyze: analyzing' );
	const chart = getViewerData( stats, './public/evergreen' );
	console.log( 'Analyze: writing chart.json file' );
	writeFileSync( 'client/chart.json', JSON.stringify( chart, null, 2 ) );
	console.log( 'Analyze: finished' );
}
