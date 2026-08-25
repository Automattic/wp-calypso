import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from '../../utils/link';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

export const FREE_DOMAIN_UPSELL_ID = 'omnibar-free-domain';

export function isFreeDomainUpsellEligible( site?: Site ): site is Site {
	return (
		isEnabled( 'dashboard/omnibar-free-domain-chip' ) &&
		!! site &&
		!! site.plan?.is_free &&
		isSimple( site ) &&
		! site.is_wpcom_staging_site
	);
}

export function getFreeDomainUpsellHref( site: Site ) {
	return wpcomLink( addQueryArgs( '/setup/domain-and-plan', { siteSlug: site.slug } ) );
}
