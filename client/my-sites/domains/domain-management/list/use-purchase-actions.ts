import { userPurchasesQuery } from '@automattic/api-queries';
import { DomainStatusPurchaseActions, ResponseDomain } from '@automattic/domains-table';
import { useQuery } from '@tanstack/react-query';
import { handleRenewNowClick } from 'calypso/lib/purchases';
import {
	monthsUntilCardExpires,
	shouldRenderExpiringCreditCard,
} from 'calypso/me/purchases/lib/raw-purchase-helpers';
import { useDispatch } from 'calypso/state';

export const usePurchaseActions = () => {
	const dispatch = useDispatch();
	const { data: purchases } = useQuery( userPurchasesQuery() );

	const findPurchase = ( domain: ResponseDomain ) =>
		purchases?.find( ( p ) => Number( p.ID ) === parseInt( domain.subscriptionId ?? '', 10 ) );

	const isCreditCardExpiring = ( domain: ResponseDomain ) => {
		const purchase = findPurchase( domain );

		return purchase ? shouldRenderExpiringCreditCard( purchase ) : false;
	};

	const isPurchasedDomain = ( domain: ResponseDomain ) => {
		return !! findPurchase( domain );
	};

	const monthsUtilCreditCardExpires = ( domain: ResponseDomain ) => {
		const purchase = findPurchase( domain );

		return purchase ? monthsUntilCardExpires( purchase ) : null;
	};

	const onRenewNowClick = ( siteSlug: string, domain: ResponseDomain ) => {
		const purchase = findPurchase( domain );
		if ( purchase ) {
			dispatch( handleRenewNowClick( purchase, siteSlug ) );
		}
	};

	const purchaseActions: DomainStatusPurchaseActions = {
		isCreditCardExpiring,
		isPurchasedDomain,
		monthsUtilCreditCardExpires,
		onRenewNowClick,
	};

	return purchaseActions;
};
