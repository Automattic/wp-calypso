const { spawnSync } = require( 'child_process' );
const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

function getGitInfo( cmd ) {
	return spawnSync( 'git', cmd.split( ' ' ), {
		encoding: 'utf8',
	} ).stdout.replace( '\n', '' );
}

module.exports = ( {
	cache_buster = getGitInfo( 'describe --always --dirty --long' ),
	commit_hash = getGitInfo( 'rev-parse HEAD' ),
	outputPath,
} ) => {
	return new HtmlWebpackPlugin( {
		filename: path.join( outputPath, 'build_meta.json' ),
		template: path.join( __dirname, 'build_meta_template.txt' ),
		inject: false,
		minify: { collapseWhitespace: false },
		cache_buster,
		commit_hash,
	} );
};
