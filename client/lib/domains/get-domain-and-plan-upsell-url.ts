import { addQueryArgs } from '@wordpress/url';

interface GetDomainUpsellUrlParams {
	siteSlug: string;
	step?: 'domains' | 'plans';
	suggestion?: string;
	backUrl?: string;
	/**
	 * Template URL for the domain connection setup page, with `%s` standing in for the
	 * domain name. Callers rendered by the dashboard should pass
	 * `getDomainConnectionSetupTemplateUrl()` so that connecting a domain finishes on the
	 * dashboard's own setup page; without it the flow falls back to classic Calypso.
	 */
	domainConnectionSetupUrl?: string;
}

export const getDomainAndPlanUpsellUrl = ( {
	siteSlug,
	backUrl,
	step = 'domains',
	suggestion,
	domainConnectionSetupUrl,
}: GetDomainUpsellUrlParams ) => {
	if ( step === 'domains' ) {
		return addQueryArgs( '/setup/domain-and-plan', {
			siteSlug,
			back_to: backUrl,
			new: suggestion,
			domainConnectionSetupUrl,
		} );
	}

	return addQueryArgs( '/setup/domain-and-plan/plans', {
		siteSlug,
		back_to: backUrl,
		domainConnectionSetupUrl,
	} );
};
