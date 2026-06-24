import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isPaymentRiskNoticeBannerEnabled } from './constants';
import type { PaymentNotice } from 'calypso/state/a8c-for-agencies/types';

export default function usePaymentRiskNotice(): PaymentNotice | null {
	const agency = useSelector( getActiveAgency );

	if ( ! isPaymentRiskNoticeBannerEnabled() ) {
		return null;
	}

	return agency?.payment_notice ?? null;
}
