import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from './link';
import { isCommerceGarden } from './site-types';
import type { Site } from '@automattic/api-core';

interface GetDomainUpsellUrlParams {
	site: Site;
	step?: 'domains' | 'plans';
	backUrl?: string;
}

export const getDomainAndPlanUpsellUrl = ( {
	site,
	backUrl,
	step = 'domains',
}: GetDomainUpsellUrlParams ) => {
	if ( step === 'domains' ) {
		return addQueryArgs( wpcomLink( '/setup/domain-and-plan' ), {
			siteSlug: site.slug,
			back_to: backUrl,
		} );
	}

	return addQueryArgs(
		isCommerceGarden( site )
			? wpcomLink( '/setup/woo-hosted-plans/plans' )
			: wpcomLink( '/setup/domain-and-plan/plans' ),
		{
			siteSlug: site.slug,
			back_to: backUrl,
		}
	);
};
