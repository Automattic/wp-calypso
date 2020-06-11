module.exports = ( { options } ) => {
	const plugins = { autoprefixer: {} };
	if ( options.transformCssProperties ) {
		plugins[ 'postcss-custom-properties' ] = {
			importFrom: [ options.customProperties ],
		};
	}
	return { plugins };
};
