module.exports = ( { options } ) => {
	const plugins = { autoprefixer: {} };
	if ( options.transformCssProperties ) {
		plugins[ 'postcss-custom-properties' ] = {
			preserve: false, // remove custom props from fallback browsers' CSS
			importFrom: [ options.customProperties ],
		};
	}
	return { plugins };
};
