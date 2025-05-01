import { formatCurrency } from '@automattic/number-formatters';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import type { Referral } from '../types';

export default function CommissionsColumn( { referral }: { referral: Referral } ) {
	const { data, isFetching } = useProductsQuery( false, false, true );

	const { expectedCommission } = useGetConsolidatedPayoutData( [ referral ], data );

	const pendingCommission = formatCurrency( expectedCommission, 'USD' );

	return isFetching ? <TextPlaceholder /> : pendingCommission;
}
