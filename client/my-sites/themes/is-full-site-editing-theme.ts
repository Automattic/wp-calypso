import { Theme } from 'calypso/types';

export function isFullSiteEditingTheme( theme: Theme | null ): boolean {
	if ( theme?.block_theme ) {
		return true;
	}

	const features = theme?.taxonomies?.theme_feature;
	return features?.some( ( feature ) => feature.slug === 'full-site-editing' ) ?? false;
}
