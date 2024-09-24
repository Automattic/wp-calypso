import { useCallback, useContext, useEffect, useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useFetchDevLicense from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-license';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import { MarketplaceTypeContext } from '../context';
import { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import { ShoppingCartItem } from '../types';

export default function useReferralDevSite(
	selectedCartItems: ShoppingCartItem[],
	setSelectedCartItems: ( items: ShoppingCartItem[] ) => void,
	referralBlogId?: number
) {
	const { data: allProducts, isLoading: isLoadingProducts } = useProductsQuery();
	const { data: license, isLoading: isLoadingLicense } = useFetchDevLicense( referralBlogId );
	const { isLoading: isLoadingTipalti } = useGetTipaltiPayee();
	const { setMarketplaceType } = useContext( MarketplaceTypeContext );

	const product = useMemo(
		() => allProducts?.find( ( p ) => p.product_id === license?.productId ),
		[ allProducts, license?.productId ]
	);

	const referralPlanAdded = useMemo(
		() => license && selectedCartItems.some( ( item ) => item.licenseId === license.licenseId ),
		[ selectedCartItems, license ]
	);

	const addReferralPlanToCart = useCallback( () => {
		if ( product && license && ! referralPlanAdded ) {
			const cartProduct: ShoppingCartItem = {
				...product,
				quantity: 1,
				licenseId: license.licenseId,
				siteUrls: [ license.siteUrl ],
			};

			// Wait for the next tick to set the selected cart items, to avoid outdated marketplace type
			setTimeout( () => {
				setSelectedCartItems( [ cartProduct ] );
			}, 0 );
		}
	}, [ license, product, referralPlanAdded, setSelectedCartItems ] );

	useEffect( () => {
		// On mount, set the marketplace type to referral if the referralBlogId is present.
		if ( referralBlogId ) {
			setMarketplaceType( MARKETPLACE_TYPE_REFERRAL );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return {
		addReferralPlanToCart,
		isLoading: isLoadingProducts || isLoadingLicense || isLoadingTipalti,
	};
}
