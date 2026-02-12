import ConsolidatedViews from '../consolidated-view';
import type { Referral, ReferralCommissionPayoutResponse } from '../types';

interface Props {
	referral: Referral;
	referralCommissionPayout?: ReferralCommissionPayoutResponse | undefined;
}

export default function ReferralCommissions( { referral, referralCommissionPayout }: Props ) {
	return (
		<ConsolidatedViews
			isSingleClient
			referrals={ [ referral ] }
			referralCommissionPayout={ referralCommissionPayout }
		/>
	);
}
