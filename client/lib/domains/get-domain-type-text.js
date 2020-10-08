/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

export function getDomainTypeText( domain = {} ) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			return 'Mapped Domain';

		case domainTypes.REGISTERED:
			if ( domain?.isPremium ) {
				return 'Premium Domain';
			}

			return 'Registered Domain';

		case domainTypes.SITE_REDIRECT:
			return 'Site Redirect';

		case domainTypes.WPCOM:
			return 'Default Site Domain';

		case domainTypes.TRANSFER:
			return 'Domain Transfer';

		default:
			return '';
	}
}
