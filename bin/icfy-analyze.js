/** @format */

const { execSync } = require( 'child_process' );
const { getViewerData, readStatsFromFile } = require( 'webpack-bundle-analyzer/lib/analyzer' );
const { writeFileSync } = require( 'fs' );

analyzeBundle();

function analyzeBundle() {
	const stats = readStatsFromFile( 'stats.json' );
	const chart = getViewerData( stats, './public' );
	writeFileSync( 'chart.json', JSON.stringify( chart, null, 2 ) );
}
