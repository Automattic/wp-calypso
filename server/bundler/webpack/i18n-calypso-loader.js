module.exports = function( content ) {
	this.cacheable && this.cacheable();

	if ( this.resource.endsWith( 'node_modules/i18n-calypso/lib/index.js' ) ) {
		return content.replace(
			'	moment.locale( localeSlug );',
			`	// Block injected at build time via i18n-calypso-loader Webpack loader
	if ( localeSlug === 'en' ) {
		// Moment ships with the English locale by default, no need to load anything in that case
		moment.locale( localeSlug );
	} else {
		require( 'bundle?name=moment-locale-[name]!moment/locale/' + localeSlug )( function() {
			moment.locale( localeSlug );
		} );
	}` );
	}

	return content;
};
