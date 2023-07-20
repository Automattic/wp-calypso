import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { InfiniteData } from '@tanstack/react-query';
import type { ResponseDomain } from 'calypso/lib/domains/types';

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

	//Due to Jetpack sites overriding the user.ID with a completely different thing,
	//when Jetpack overrides this property, the original WordPress.com user Id
	//ends stored as user.linked_user_ID, so in those cases, that's the ID we have to use.
	const ownerUser = teams?.users?.find(
		( user ) => ( user.linked_user_ID ?? user.ID ) === domainSubscription?.userId
	);

	return ownerUser?.login ?? '';
}
