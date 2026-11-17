/**
 * The retired `/start/website-design-services` flow, DIFM's purchase for an existing site,
 * redirects to the do-it-for-me flow, which asks for the site itself.
 */
export const LEGACY_WEBSITE_DESIGN_SERVICES_FLOW = 'website-design-services';

/**
 * The do-it-for-me URL the retired flow redirects to.
 * @param locale Locale slug to keep, when it isn't the default.
 * @param search Query string to carry over, without the leading `?`.
 */
export function getWebsiteDesignServicesRedirect( locale = '', search = '' ): string {
	return `/start/do-it-for-me${ locale ? `/${ locale }` : '' }${ search ? `?${ search }` : '' }`;
}
