import { type as domainTypes, domainTitleContext } from './constants';

/**
 * Translate function placeholder.
 *
 * @param   {string} string Input string
 * @returns {string}        Returns the input string
 */
function translatePlaceholder( string ) {
	return string;
}

/**
 * Get domain type text.
 *
 * @param   {Object}   domain Domain object
 * @param   {Function} __     Translate function
 * @param   {string} context  Context of the returned text (DOMAIN_ITEM: item of a domain list, PAGE_TITLE: title when managing the domain)
 * @returns {string}          Domain type text
 */
export function getDomainTypeText(
	domain = {},
	__ = translatePlaceholder,
	context = domainTitleContext.DOMAIN_ITEM
) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			if ( context === domainTitleContext.PAGE_TITLE ) {
				return __( 'Connected domain' );
			}

			return __( 'Managed by external provider' );

		case domainTypes.REGISTERED:
			if ( domain?.isPremium ) {
				return __( 'Premium Domain' );
			}

			return __( 'Registered Domain' );

		case domainTypes.SITE_REDIRECT:
			return __( 'Site Redirect' );

		case domainTypes.WPCOM:
			return __( 'Default Site Domain' );

		case domainTypes.TRANSFER:
			return __( 'Domain Transfer' );

		default:
			return '';
	}
}
