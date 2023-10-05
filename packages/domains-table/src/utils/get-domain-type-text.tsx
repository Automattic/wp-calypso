import { type as domainTypes, domainInfoContext } from './constants';
import { ResponseDomain } from './types';
import type { __ as __type } from '@wordpress/i18n';

export function getDomainTypeText(
	domain: ResponseDomain,
	__: typeof __type = ( text: string ) => text,
	context = domainInfoContext.DOMAIN_ITEM
) {
	const underMaintenance = domain?.tldMaintenanceEndTime && domain?.tldMaintenanceEndTime > 0;
	const domainText = () => {
		switch ( domain.type ) {
			case domainTypes.MAPPED:
				if ( context === domainInfoContext.PAGE_TITLE ) {
					return __( 'Connected Domain', __i18n_text_domain__ );
				}

				return __( 'Registered with an external provider', __i18n_text_domain__ );

			case domainTypes.REGISTERED:
				if ( domain?.isPremium ) {
					return __( 'Premium Domain', __i18n_text_domain__ );
				}

				// Registered domains don't show any type text in the domain row component
				if ( context === domainInfoContext.DOMAIN_ROW ) {
					return null;
				}
				return __( 'Registered Domain', __i18n_text_domain__ );

			case domainTypes.SITE_REDIRECT:
				return __( 'Site Redirect', __i18n_text_domain__ );

			case domainTypes.WPCOM:
				return __( 'Default Site Domain', __i18n_text_domain__ );

			case domainTypes.TRANSFER:
				return __( 'Domain Transfer', __i18n_text_domain__ );

			default:
				return '';
		}
	};

	const text = domainText();
	return ! text && underMaintenance
		? __( 'Domain is under maintenance', __i18n_text_domain__ )
		: text;
}
