import { isDomainProduct } from '@automattic/calypso-products';
import { SiteExcerptData } from '@automattic/sites';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';

const useCanUserLeaveBlog = ( site: SiteExcerptData ) => {
	const userId = useSelector( getCurrentUserId );
	const purchases = useSelector( ( state ) => getSitePurchases( state, site?.ID ) );

	const isPlanOwner = site.plan?.user_is_owner === true;
	const isSiteOwner = site.site_owner === userId;

	if ( isPlanOwner || isSiteOwner ) {
		return false;
	}

	const ownsDomainPurchase = purchases.some( ( purchase ) => {
		const isDomainPurchaseOwner = isDomainProduct( purchase ) && purchase.userId === userId;

		return isDomainPurchaseOwner;
	} );

	if ( ownsDomainPurchase ) {
		return false;
	}

	return true;
};

export default useCanUserLeaveBlog;
