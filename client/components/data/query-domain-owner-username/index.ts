import { useSelector } from 'react-redux';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { InfiniteData } from 'react-query';

type User = {
	ID: number;
	linked_user_ID: number;
	login: string;
};

type UsersData = {
	users: User[];
};

export function useDomainOwnerUserName(
	selectedSite: SiteDetails | null | undefined,
	domain: ResponseDomain | null | undefined
): string {
	useQuerySitePurchases( selectedSite?.ID ?? -1 );

	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );

	const selectedSubscriptionId = domain?.subscriptionId ?? '0';

	const domainSubscription = purchases.find(
		( purchase ) => purchase.id === parseInt( selectedSubscriptionId )
	);

	const { data, isLoading } = useUsersQuery(
		selectedSite?.ID,
		{},
		{
			enabled: domainSubscription !== undefined,
		}
	);

	if ( isLoading || ! domainSubscription ) {
		return '';
	}

	const teams = data as InfiniteData< UsersData > & UsersData;
	const ownerUser = teams.users?.find(
		( user ) => ( user.linked_user_ID ?? user.ID ) === domainSubscription?.userId
	);
	const ownerUserName = ownerUser?.login ?? '';

	return ownerUserName ?? '';
}
