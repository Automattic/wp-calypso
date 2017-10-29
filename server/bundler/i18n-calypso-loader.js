/**
 * Webpack loader used to inject Webpack code into `i18n-calypso` module to
 * load asyncronously the current locale.
 */

module.exports = function( content ) {
	this.cacheable && this.cacheable();

	if ( this.resource.endsWith( 'node_modules/i18n-calypso/lib/index.js' ) ) {
		const newContent = content.replace(
			'	moment.locale( this.state.localeSlug );',
			`	// Block injected at build time via i18n-calypso-loader Webpack loader
	if ( this.state.localeSlug === 'en' ) {
		// Moment ships with the English locale by default, no need to load anything in that case
	} else {
	    import(
			/* webpackChunkName: moment/locale/[request] */
			'moment/locale/' + this.state.localeSlug
		).then( _ => {
			moment.locale( this.state.localeSlug );
		});
	}` );
		return newContent;
	}

	return content;
};
