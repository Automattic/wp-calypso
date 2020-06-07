module.exports = ( { options } ) => {
	const plugins = { autoprefixer: {} };
	if ( options.transformCssProperties ) {
		plugins[ 'postcss-custom-properties' ] = {
			preserve: false, // remove custom props from fallback browsers' CSS
			importFrom: {
				customProperties: options.customProperties,
			},
		};
	}
	return { plugins };
};
