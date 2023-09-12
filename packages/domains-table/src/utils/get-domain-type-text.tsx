import { type as domainTypes, domainInfoContext } from './constants';
import { ResponseDomain } from './types';

export function getDomainTypeText(
	domain: ResponseDomain,
	__ = ( text: string ) => text,
	context = domainInfoContext.DOMAIN_ITEM
) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			if ( context === domainInfoContext.PAGE_TITLE ) {
				return __( 'Connected Domain' );
			}

			return 'Registered with an external provider';

		case domainTypes.REGISTERED:
			if ( domain?.isPremium ) {
				return __( 'Premium Domain' );
			}

			// Registered domains don't show any type text in the domain row component
			if ( context === domainInfoContext.DOMAIN_ROW ) {
				return null;
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
