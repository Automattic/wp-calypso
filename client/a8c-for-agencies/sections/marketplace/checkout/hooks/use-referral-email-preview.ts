import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getLogoCacheKey } from 'calypso/a8c-for-agencies/lib/logo-url-utils';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { TermPricingType } from '../../types';

interface ReferralEmailPreviewResponse {
	html: string;
}

interface UseReferralEmailPreviewParams {
	productIds: number[];
	greetingLine?: string;
	logoUrl?: string | null;
	termPricing: TermPricingType;
	enabled?: boolean;
}

export default function useReferralEmailPreview( {
	productIds,
	greetingLine,
	logoUrl,
	termPricing,
	enabled = true,
}: UseReferralEmailPreviewParams ): UseQueryResult< ReferralEmailPreviewResponse, Error > {
	const agencyId = useSelector( getActiveAgencyId );

	const logoKey = getLogoCacheKey( logoUrl );

	return useQuery< ReferralEmailPreviewResponse, Error >( {
		queryKey: [
			'referral-email-preview',
			agencyId,
			productIds,
			greetingLine,
			logoKey,
			logoUrl,
			termPricing,
		],
		queryFn: async () => {
			if ( ! agencyId ) {
				throw new Error( 'Agency ID is required' );
			}
			return wpcom.req.post( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referral-email-preview`,
				body: {
					product_ids: productIds,
					greeting_line: greetingLine || '',
					logo_url: logoUrl || undefined,
					term_pricing: termPricing,
				},
			} );
		},
		enabled: enabled && productIds.length > 0 && !! agencyId,
	} );
}
