import ConsolidatedViews from '../consolidated-view';
import type { Referral, ReferralInvoice } from '../types';

export default function ReferralCommissions( {
	referral,
	referralInvoices,
}: {
	referral: Referral;
	referralInvoices: ReferralInvoice[];
} ) {
	return <ConsolidatedViews referrals={ [ referral ] } referralInvoices={ referralInvoices } />;
}
