const additionalKeywords = [ 'logo', 'brand', 'emblem', 'hallmark' ];

wp.hooks.addFilter( 'blocks.registerBlockType', 'core/image', ( settings, name ) => {
	if ( name !== 'core/image' ) {
		return settings;
	}

	settings = lodash.assign( {}, settings, {
		keywords: settings.keywords.concat( additionalKeywords ),
	} );

	return settings;
} );
