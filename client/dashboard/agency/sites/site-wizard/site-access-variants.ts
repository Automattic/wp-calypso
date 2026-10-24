export const SITE_ACCESS_VARIANTS = [
	{ value: 'menu', label: 'Original' },
	{ value: 'menu-clean', label: 'Clean' },
] as const;

export type SiteAccessIllustrationVariant = ( typeof SITE_ACCESS_VARIANTS )[ number ][ 'value' ];

export function isSiteAccessIllustrationVariant(
	value: unknown
): value is SiteAccessIllustrationVariant {
	return SITE_ACCESS_VARIANTS.some( ( variant ) => variant.value === value );
}
