import { useQuery } from '@tanstack/react-query';
import { ThemeTier } from 'calypso/data/themes/types';
import wpcom from 'calypso/lib/wp';

export type RetainedBenefit = {
	is_eligible: boolean;
	eligibility_expiration_date: number;
	tier: ThemeTier;
};

export type TierRetainedBenefits = {
	[ index: string ]: RetainedBenefit;
};

export const useTierRetainedBenefitsQuery = (
	siteId: number | null,
	themeSlug: string
): RetainedBenefit | null => {
	const queryKey = [ 'themeTierRetainedBenefits', siteId ];

	const query = useQuery< TierRetainedBenefits >( {
		queryKey,
		queryFn: () => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/themes/retained-benefits`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! siteId,
	} );

	return query?.data?.[ themeSlug ] ?? null;
};
