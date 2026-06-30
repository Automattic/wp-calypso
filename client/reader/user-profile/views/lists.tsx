import { readUserListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { UserLists } from 'calypso/reader/list/components/user-lists';
import { List } from 'calypso/reader/list-manage/types';
import type { ReaderUser } from '@automattic/api-core';
import type { JSX } from 'react';

interface UserProfileListsProps {
	user: ReaderUser;
}

export const UserProfileLists = ( { user }: UserProfileListsProps ): JSX.Element => {
	const userLogin = user.user_login ?? '';
	const { data, isLoading, isFetched } = useQuery( readUserListsQuery( userLogin ) );
	const lists = data?.lists ?? [];
	const visibleLists = lists.filter(
		( list: List ) => ! ( list.slug === 'recommended-blogs' && list.is_owner )
	);

	return <UserLists lists={ visibleLists } isLoading={ isLoading || ! isFetched } />;
};

export default UserProfileLists;
