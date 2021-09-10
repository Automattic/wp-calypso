// Adapts route paths to also include wildcard
// subroutes under the root level section.
export function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

export function isFullSiteEditingTheme( theme ) {
	const features = theme?.taxonomies?.theme_feature;
	return features && features.some( ( feature ) => feature.slug === 'block-templates' );
}
