import { addQueryArgs } from '@wordpress/url';
import { shouldRenderRewrittenDomainSearch } from './should-render-rewritten-domain-search';

interface GetDomainUpsellUrlParams {
	siteSlug: string;
	step?: 'domains' | 'plans';
	suggestion?: string;
	backUrl?: string;
}

export const getDomainAndPlanUpsellUrl = ( {
	siteSlug,
	backUrl,
	step = 'domains',
	suggestion,
}: GetDomainUpsellUrlParams ) => {
	if ( step === 'domains' ) {
		if ( shouldRenderRewrittenDomainSearch() ) {
			return addQueryArgs( '/setup/domain-and-plan', {
				siteSlug,
				back_to: backUrl,
				new: suggestion,
			} );
		}

		return addQueryArgs( `/domains/add/${ siteSlug }`, {
			domainAndPlanPackage: true,
			domain: true,
			back_to: backUrl,
		} );
	}

	if ( shouldRenderRewrittenDomainSearch() ) {
		return addQueryArgs( '/setup/domain-and-plan/plans', {
			siteSlug,
			back_to: backUrl,
		} );
	}

	return addQueryArgs( `/plans/yearly/${ siteSlug }`, {
		domain: true,
		domainAndPlanPackage: true,
		back_to: backUrl,
	} );
};
