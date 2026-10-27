import { sitePurchasesQuery } from '@automattic/api-queries';
import { isTitanMail, isGoogleWorkspace } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
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
	const siteId = selectedSite?.ID;
	const { data: purchases } = useQuery( {
		...sitePurchasesQuery( siteId ?? 0 ),
		enabled: Boolean( siteId ),
	} );

	const emailSubscription = purchases?.find(
		( purchase ) =>
			( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) && purchase.meta === domainName
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
		( user ) => ( user.linked_user_ID ?? user.ID ) === emailSubscription.user_id
	);

	return ownerUser?.login ?? '';
}
