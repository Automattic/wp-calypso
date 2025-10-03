import { addQueryArgs } from '@wordpress/url';
import { shouldRenderRewrittenDomainSearch } from './should-render-rewritten-domain-search';

interface GetDomainUpsellUrlParams {
	siteSlug: string;
	step?: 'domains' | 'plans';
	suggestion?: string;
	backUrl?: string;
	domain?: boolean;
	/**
	 * This is necessary while we don't remove the feature flag and ?domainAndPlanPackage=true entirely.
	 * Some entrypoints currently link to the domain and package plan flow instead of the domains/add page.
	 */
	forceStepperFlow?: boolean;
}

export const getDomainAndPlanUpsellUrl = ( {
	siteSlug,
	backUrl,
	step = 'domains',
	suggestion,
	domain,
	forceStepperFlow,
}: GetDomainUpsellUrlParams ) => {
	if ( step === 'domains' ) {
		if ( shouldRenderRewrittenDomainSearch() || forceStepperFlow ) {
			return addQueryArgs( '/setup/domain-and-plan', {
				siteSlug,
				back_to: backUrl,
				new: suggestion,
			} );
		}

		return addQueryArgs( `/domains/add/${ siteSlug }`, {
			domainAndPlanPackage: true,
			domain,
			back_to: backUrl,
		} );
	}

	if ( shouldRenderRewrittenDomainSearch() || forceStepperFlow ) {
		return addQueryArgs( '/setup/domain-and-plan/plans', {
			siteSlug,
			back_to: backUrl,
		} );
	}

	return addQueryArgs( `/plans/yearly/${ siteSlug }`, {
		domain,
		domainAndPlanPackage: true,
		back_to: backUrl,
	} );
};
