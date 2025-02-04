import ConsolidatedViews from '../consolidated-view';
import type { Referral } from '../types';

export default function ReferralCommissions( { referral }: { referral: Referral } ) {
	return <ConsolidatedViews referrals={ [ referral ] } />;
}
