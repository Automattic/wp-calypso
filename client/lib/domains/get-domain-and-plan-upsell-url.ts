import { addQueryArgs } from '@wordpress/url';

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
		return addQueryArgs( '/setup/domain-and-plan', {
			siteSlug,
			back_to: backUrl,
			new: suggestion,
		} );
	}

	return addQueryArgs( '/setup/domain-and-plan/plans', {
		siteSlug,
		back_to: backUrl,
	} );
};
