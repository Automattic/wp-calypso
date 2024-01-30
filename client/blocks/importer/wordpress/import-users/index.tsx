import InfiniteList from 'calypso/components/infinite-list';
import useUsersQuery from 'calypso/data/users/use-users-query';
import ImportedUserItem from './imported-user-item';
import type { UsersQuery, Member } from '@automattic/data-stores';

const ImportUsers = ( { site } ) => {
	const defaultTeamFetchOptions = { include_viewers: true };
	const usersQuery = useUsersQuery( site?.ID, defaultTeamFetchOptions ) as unknown as UsersQuery;
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	const members = data?.users || [];

	const getUserRef = ( user: Member ) => {
		return 'user-' + user?.ID;
	};

	const renderUser = ( user: Member ) => {
		const type = user.roles ? 'email' : 'viewer';

		return <ImportedUserItem key={ user?.ID } user={ user } site={ site } type={ type } />;
	};

	return (
		<InfiniteList
			items={ members }
			fetchNextPage={ fetchNextPage }
			fetchingNextPage={ isFetchingNextPage }
			lastPage={ ! hasNextPage }
			renderItem={ renderUser }
			getItemRef={ getUserRef }
			guessedItemHeight={ 126 }
		/>
	);
};

export default ImportUsers;
