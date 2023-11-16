import { DomainStatusPurchaseActions, ResponseDomain } from '@automattic/domains-table';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import {
	handleRenewNowClick,
	monthsUntilCardExpires,
	shouldRenderExpiringCreditCard,
} from 'calypso/lib/purchases';
import { useDispatch, useSelector } from 'calypso/state';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

export const usePurchaseActions = () => {
	useQueryUserPurchases();

	const dispatch = useDispatch();
	const purchases = useSelector( getUserPurchases );

	const isCreditCardExpiring = ( domain: ResponseDomain ) => {
		const purchase = purchases?.find(
			( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
		);

		return purchase ? shouldRenderExpiringCreditCard( purchase ) : false;
	};

	const isPurchasedDomain = ( domain: ResponseDomain ) => {
		const purchase = purchases?.find(
			( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
		);
		return !! purchase;
	};

	const monthsUtilCreditCardExpires = ( domain: ResponseDomain ) => {
		const purchase = purchases?.find(
			( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
		);

		return purchase ? monthsUntilCardExpires( purchase ) : null;
	};

	const onRenewNowClick = ( siteSlug: string, domain: ResponseDomain ) => {
		const purchase = purchases?.find(
			( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
		);
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
