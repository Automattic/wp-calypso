/**
 * Based global WP.com blog_public option, checks whether current blog is
 * private or not.
 *
 * @return {boolean} a private WP.com blog flag
 */
export const getIsBlogPrivate = () =>
	typeof window === 'object' &&
	window.wpcomGutenberg &&
	Number( window.wpcomGutenberg.blogPublic ) === -1;
