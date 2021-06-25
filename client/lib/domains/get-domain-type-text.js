/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

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
 * @returns {string}          Domain type text
 */
export function getDomainTypeText( domain = {}, __ = translatePlaceholder ) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			return __( 'Mapped Domain' );

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
