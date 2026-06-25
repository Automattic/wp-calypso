import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { PaymentNotice } from 'calypso/state/a8c-for-agencies/types';

export default function usePaymentRiskNotice(): PaymentNotice | null {
	const agency = useSelector( getActiveAgency );

	return agency?.payment_notice ?? null;
}
