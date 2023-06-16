import useUsersQuery from 'calypso/data/users/use-users-query';

interface User {
	ID: number;
	login: string;
	email: string;
	linked_user_ID: number;
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
	excludeUserIDs?: number[];
}

export function useAdministrators( { siteId, excludeUserIDs }: UseAdministratorsParams ) {
	const queryResult = useUsersQuery(
		siteId,
		{ role: 'administrator' },
		{
			select: ( data: UserResponse ) => {
				const users = data?.pages?.[ 0 ]?.users || [];
				if ( excludeUserIDs ) {
					return users.filter( ( user ) => ! excludeUserIDs.includes( user.linked_user_ID ) );
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
