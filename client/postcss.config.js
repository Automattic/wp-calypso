module.exports = ( { options } ) => {
	const plugins = { autoprefixer: {} };
	if ( options.transformCssProperties ) {
		plugins[ 'postcss-custom-properties' ] = {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
		};
	}
	return { plugins };
};
