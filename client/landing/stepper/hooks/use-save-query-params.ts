import { ecommerceFlowRecurTypes } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { ONBOARD_STORE } from '../stores';
import { useQuery } from './use-query';

/**
 * This method saves some query params to the store. For example,
 * coupon code or storage addons provided in the query param will be
 * persisted to the Store so that they can later be retrieved and applied
 * at checkout.
 */
export function useSaveQueryParams() {
	const urlQueryParams = useQuery();
	const { setCouponCode, setStorageAddonSlug, setEcommerceFlowRecurType, setPartnerBundle } =
		useDispatch( ONBOARD_STORE );

	urlQueryParams.forEach( ( value, key ) => {
		switch ( key ) {
			case 'coupon':
				// This stores the coupon code query param, and the flow declaration
				// will append it to the checkout URL so that it auto-applies the coupon code at
				// checkout. For example, /setup/ecommerce/?coupon=SOMECOUPON will auto-apply the
				// coupon code at the checkout page.
				value && setCouponCode( value );
				break;

			case 'storage':
				// This stores a storage addon, supplied as a query param by landing pages when
				// an addon is selected in the pricing grid.
				value && setStorageAddonSlug( value );
				break;

			case 'partnerBundle':
				// This stores a partner bundle string, supplied as a query param in landing pages
				// related to a partner partnership.
				value && setPartnerBundle( value );
				break;

			case 'recur':
				{
					const isValidRecurType =
						value && Object.values( ecommerceFlowRecurTypes ).includes( value );
					const recurType = isValidRecurType ? value : ecommerceFlowRecurTypes.YEARLY;
					setEcommerceFlowRecurType( recurType );
				}
				break;
		}
	} );
}
