import { formatCurrency } from '@automattic/format-currency';
import { useEffect, useState } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { calculateCommissions } from '../lib/commissions';
import type { Referral } from '../types';

export default function CommissionsColumn( { referral }: { referral: Referral } ) {
	const { data, isFetching } = useProductsQuery( false, false, true );

	const [ commissions, setCommissions ] = useState< number >( 0 );

	useEffect( () => {
		const commissions = calculateCommissions( referral, data || [] );
		setCommissions( commissions );
	}, [ referral, data ] );

	return isFetching ? <TextPlaceholder /> : formatCurrency( commissions, 'USD' );
}
