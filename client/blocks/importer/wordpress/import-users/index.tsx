import InfiniteList from 'calypso/components/infinite-list';
import useUsersQuery from 'calypso/data/users/use-users-query';
import UserListItem from './user-list-item';

const ImportUsers = ( { site } ) => {
	const defaultTeamFetchOptions = { include_viewers: true };
	const usersQuery = useUsersQuery( site?.ID, defaultTeamFetchOptions ) as unknown as UsersQuery;
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	console.log( 'data', data );
	const members = data?.users || [];

	const getUserRef = ( user ) => {
		return 'user-' + user?.ID;
	};

	const renderUser = ( user ) => {
		const type = user.roles ? 'email' : 'viewer';

		return <UserListItem key={ user?.ID } user={ user } site={ site } type={ type } />;
	};

	return (
		<div>
			<InfiniteList
				items={ members }
				fetchNextPage={ fetchNextPage }
				fetchingNextPage={ isFetchingNextPage }
				lastPage={ ! hasNextPage }
				renderItem={ renderUser }
				getItemRef={ getUserRef }
				guessedItemHeight={ 126 }

			/>
		</div>
	);
};

export default ImportUsers;
