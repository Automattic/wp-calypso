export function isFullSiteEditingTheme( theme ) {
	const features = theme?.taxonomies?.theme_feature;
	return features && features.some( ( feature ) => feature.slug === 'block-templates' );
}
