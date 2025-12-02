import { useLocale } from '@automattic/i18n-utils';
import { useMemo } from 'react';
import useFetchClientProducts from 'calypso/a8c-for-agencies/data/client/use-fetch-client-products';
import { formatDate } from 'calypso/dashboard/utils/datetime';
import { useSelector } from 'calypso/state';
import { getUserBillingType } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { ReferralProduct } from '../sections/client/types';

export const useSubscriptionDetails = ( subscription?: ReferralProduct ) => {
	const locale = useLocale();
	const { data: products, isFetching: isFetchingProductInfo } = useFetchClientProducts( false );
	const isBillingTypeBD = useSelector( getUserBillingType ) === 'billingdragon';

	const storeSubscription = subscription?.subscription;

	const productName = useMemo( () => {
		return isBillingTypeBD && storeSubscription?.product_name
			? storeSubscription.product_name
			: products?.find( ( product ) => product.product_id === subscription?.product_id )?.name ??
					'';
	}, [ isBillingTypeBD, storeSubscription?.product_name, products, subscription?.product_id ] );

	const expiryDate = useMemo( () => {
		return storeSubscription?.expiry
			? formatDate( new Date( storeSubscription.expiry ), locale, { dateStyle: 'long' } )
			: '';
	}, [ storeSubscription?.expiry, locale ] );

	return {
		products,
		isFetchingProductInfo,
		storeSubscription,
		productName,
		expiryDate,
		isBillingTypeBD,
	};
};

export type UseSubscriptionDetailsReturn = ReturnType< typeof useSubscriptionDetails >;
