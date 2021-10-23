import { Theme } from 'calypso/types';

export function isFullSiteEditingTheme( theme: Theme | null ): boolean | undefined {
	const features = theme?.taxonomies?.theme_feature;
	return features && features.some( ( feature ) => feature.slug === 'block-templates' );
}
