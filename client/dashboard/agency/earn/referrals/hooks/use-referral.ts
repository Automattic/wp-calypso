import { activeAgencyQuery, referralsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { earnReferralRoute } from '../../../../app/router/agency';
import type { Referral } from '@automattic/api-core';

export function useReferral(): {
	referral?: Referral;
	agencyId: number;
} {
	const { referralId } = earnReferralRoute.useParams();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: referrals = [] } = useQuery( referralsQuery( agencyId ) );

	return {
		referral: referrals.find( ( item ) => String( item.id ) === referralId ),
		agencyId,
	};
}
