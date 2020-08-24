/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

export function getDomainTypeText( domain = {} ) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			return 'Mapped Domain';

		case domainTypes.REGISTERED:
			return 'Registered Domain';

		case domainTypes.SITE_REDIRECT:
			return 'Site Redirect';

		case domainTypes.WPCOM:
			return 'Default Site Domain';

		case domainTypes.TRANSFER:
			return 'Transfer';

		default:
			return '';
	}
}
