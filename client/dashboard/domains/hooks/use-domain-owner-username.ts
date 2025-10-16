import { Domain, Site, SiteUser } from '@automattic/api-core';
import { sitePurchasesQuery, siteUsersQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

interface User extends SiteUser {
	linked_user_ID: number;
	login: string;
}

export function useDomainOwnerUserName(
	selectedSite: Site | null | undefined,
	domain: Domain | null | undefined
): string {
	const selectedSubscriptionId = domain?.subscription_id ?? '0';

	const { data: purchases } = useQuery( sitePurchasesQuery( selectedSite?.ID ?? -1 ) );
	const domainSubscription = purchases?.find(
		( purchase ) => purchase.ID === parseInt( selectedSubscriptionId )
	);

	const { data: users, isLoading } = useQuery( {
		// @ts-expect-error the query is only enabled when selectedSite has a value, id won't be undefined
		...siteUsersQuery( selectedSite?.ID ),
		enabled: !! selectedSite && domainSubscription !== undefined,
	} );

	if ( isLoading || ! domainSubscription ) {
		return '';
	}

	//Due to Jetpack sites overriding the user.ID with a completely different thing,
	//when Jetpack overrides this property, the original WordPress.com user Id
	//ends stored as user.linked_user_ID, so in those cases, that's the ID we have to use.
	const ownerUser = ( users as User[] )?.find(
		( user ) => ( ( user as User ).linked_user_ID ?? user.id ) === domainSubscription?.user_id
	);

	return ownerUser?.login ?? '';
}
