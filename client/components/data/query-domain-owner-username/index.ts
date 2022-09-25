import { useSelector } from 'react-redux';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { InfiniteData } from 'react-query';

type User = {
	login: string;
};

type UsersData = {
	users: User[];
};

export function useDomainOwnerUserName(
	selectedSite: SiteDetails | null | undefined,
	domain: ResponseDomain | null | undefined
) {
	useQuerySitePurchases( selectedSite?.ID ?? -1 );

	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );

	const domainSubscription = purchases.filter(
		( purchase ) => purchase.id === parseInt( domain?.subscriptionId ?? '0' )
	)[ 0 ];

	const fetchOptions = {
		search: domainSubscription?.userId,
		search_columns: [ 'ID' ],
	};

	const { data } = useUsersQuery( selectedSite?.ID, fetchOptions, {
		enabled: domainSubscription !== undefined,
	} );

	const teams = data as InfiniteData< UsersData > & UsersData;
	const ownerUserName = teams ? teams.users[ 0 ].login : '';
	return ownerUserName;
}
