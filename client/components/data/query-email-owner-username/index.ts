import { isTitanMail, isGoogleWorkspace } from '@automattic/calypso-products';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { InfiniteData } from '@tanstack/react-query';

type User = {
	ID: number;
	linked_user_ID: number;
	login: string;
};

type UsersData = {
	users: User[];
};

export function useEmailOwnerUserName(
	selectedSite: SiteDetails | null | undefined,
	domainName: string
): string {
	useQuerySitePurchases( selectedSite?.ID ?? -1 );

	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );

	const emailSubscription = purchases.find(
		( purchase ) =>
			( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) &&
			purchase.meta === domainName &&
			purchase.active
	);

	const { data, isLoading } = useUsersQuery(
		selectedSite?.ID,
		{},
		{
			enabled: emailSubscription !== undefined,
		}
	);

	if ( isLoading || ! emailSubscription ) {
		return '';
	}

	const teams = data as InfiniteData< UsersData > & UsersData;
	const ownerUser = teams?.users?.find(
		( user ) => ( user.linked_user_ID ?? user.ID ) === emailSubscription?.userId
	);

	return ownerUser?.login ?? '';
}
