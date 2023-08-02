import { useSelector } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { getPurchases, hasLoadedUserPurchasesFromServer } from 'calypso/state/purchases/selectors';
import ManagePurchase from '.';

export function ManagePurchaseByOwnership( { ownershipId } ) {
	const purchases = useSelector( getPurchases );
	const purchaseByOwnership = purchases.find(
		( purchase ) => purchase.ownershipId === ownershipId
	);
	const hasRequestedPurchases = useSelector( hasLoadedUserPurchasesFromServer );

	if ( ! hasRequestedPurchases ) {
		return <QueryUserPurchases />;
	}

	return (
		<ManagePurchase
			purchaseId={ purchaseByOwnership?.id }
			siteSlug={ purchaseByOwnership?.domain }
		/>
	);
}
