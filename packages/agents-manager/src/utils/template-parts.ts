/**
 * Template-part slug constants used by the block editor to identify
 * structural areas (header, hero, footer) in a site template.
 */
export const TemplatePartSlug = Object.freeze( {
	Header: 'header',
	HeaderHero: 'header-hero',
	Footer: 'footer',
} );

/**
 * Pattern-category slugs that map each template part to the pattern
 * category used when inserting/replacing patterns.
 */
export const TemplatePartPatternSlug = Object.freeze( {
	Header: 'header',
	HeaderHero: 'hero',
	Footer: 'footer',
} );

const templatePartPatternSlugs = Object.values( TemplatePartPatternSlug );

export const isTemplatePartPatternSlug = ( slug: string ): boolean => {
	return ( templatePartPatternSlugs as string[] ).includes( slug );
};
