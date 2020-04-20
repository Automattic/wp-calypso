/**
 * Returns a theme base CSS URI.
 *
 * @param  {string}  themeSlug A theme slug, e.g., `pub/business`
 * @param  {boolean} isRtl     If the current locale is a right-to-left language
 * @returns {string}            The theme CSS URI.
 */
export const getThemeCssUri = ( themeSlug, isRtl ) =>
	`https://s0.wp.com/wp-content/themes/${ themeSlug }/style${ isRtl ? '-rtl' : ''}.css`;

export const DEFAULT_FONT_URI = 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,500,700';
