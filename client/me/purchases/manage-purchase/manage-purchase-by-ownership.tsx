import { userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import ManagePurchase from '.';

export function ManagePurchaseByOwnership( { ownershipId }: { ownershipId: number } ) {
	const { data: purchases, isPending } = useQuery( userPurchasesQuery() );

	const purchaseByOwnership = purchases?.find(
		( purchase ) => purchase.ownership_id === ownershipId
	);

	if ( isPending || ! purchaseByOwnership ) {
		return null;
	}

	return (
		<ManagePurchase purchaseId={ purchaseByOwnership.ID } siteSlug={ purchaseByOwnership.domain } />
	);
}
