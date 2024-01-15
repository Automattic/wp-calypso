import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type RetainedBenefit = {
	is_eligible: boolean;
	eligibility_expiration_date: number;
	tier: {
		slug: string;
		feature: string | null;
		platform: string;
	};
};

export type TierRetainedBenefits = {
	[ index: string ]: {
		retained_benefits: RetainedBenefit;
	};
};

export const useTierRetainedBenefitsQuery = (
	siteId: number | null,
	themeSlug: string
): RetainedBenefit | undefined => {
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

	if ( ! query || ! query.data || ! query.data[ themeSlug ] ) {
		return undefined;
	}

	return query?.data?.[ themeSlug ]?.retained_benefits;
};
