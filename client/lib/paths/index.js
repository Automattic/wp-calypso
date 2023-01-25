export { login } from './login';
export { lostPassword } from './lost-password';
export { onboardingUrl } from './onboarding-url';

function editorPathFromSite( site ) {
	if ( ! site ) {
		return '';
	}

	const siteSlug = typeof site === 'object' ? site.slug : site;
	return '/' + siteSlug;
}

/**
 * Returns a URL to the post editor for a new post on a given site.
 *
 * @param  {Object | string} site Site object or site slug
 * @returns {string}      URL to post editor
 */
export function newPost( site ) {
	const sitePath = editorPathFromSite( site );
	return '/post' + sitePath;
}
