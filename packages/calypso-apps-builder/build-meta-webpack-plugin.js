import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default ( { cache_buster, commit_hash, commit_url, outputPath } ) => {
	return new HtmlWebpackPlugin( {
		filename: path.join( outputPath, 'build_meta.json' ),
		template: path.join( __dirname, 'build_meta_template.txt' ),
		inject: false,
		minify: { collapseWhitespace: false },
		cache_buster,
		commit_hash,
		commit_url,
	} );
};
