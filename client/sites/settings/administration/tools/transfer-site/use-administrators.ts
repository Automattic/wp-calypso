import useUsersQuery from 'calypso/data/users/use-users-query';

export interface User {
	ID: number;
	login: string;
	email: string;
	linked_user_ID?: number | false;
}

interface Page {
	found: number;
	users: User[];
}

interface UserResponse {
	pages: Page[];
}

interface UseAdministratorsParams {
	siteId: number;
	excludeUserEmails?: string[];
}

export function useAdministrators( { siteId, excludeUserEmails }: UseAdministratorsParams ) {
	const queryResult = useUsersQuery(
		siteId,
		{ role: 'administrator' },
		{
			select: ( data: UserResponse ) => {
				const users = data?.pages?.[ 0 ]?.users || [];
				// We filter by email instead of user.ID to support simple and atomic sites.
				if ( excludeUserEmails ) {
					return users.filter( ( user ) => ! excludeUserEmails.includes( user.email ) );
				}
				return users;
			},
		}
	);
	return {
		...queryResult,
		administrators: queryResult.data as unknown as User[],
	};
}
