import { Theme } from 'calypso/types';

export function isFullSiteEditingTheme( theme: Theme | null ): boolean {
	const features = theme?.taxonomies?.theme_feature;
	return features?.some( ( feature ) => feature.slug === 'full-site-editing' ) ?? false;
}
