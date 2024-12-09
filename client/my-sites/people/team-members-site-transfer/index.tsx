import { Card } from '@automattic/components';
import InfiniteList from 'calypso/components/infinite-list';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListItemTransfer from './people-list-item-transfer';
import type { UsersQuery } from './types';
import type { Member } from '@automattic/data-stores';

import './style.scss';

interface Props {
	search?: string;
	usersQuery: UsersQuery;
	onClick: ( userLogin: string ) => void;
}
function TeamMembersSiteTransfer( props: Props ) {
	const { search, usersQuery } = props;
	const site = useSelector( getSelectedSite );
	const currentUserId = useSelector( getCurrentUserId );

	const listKey = [ 'team-members', site?.ID, search ].join( '-' );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	const members = data?.users.filter( ( user ) => user.ID !== currentUserId ) || [];

	function getPersonRef( user: Member ) {
		return 'user-' + user?.ID;
	}

	function onClick( user: Member ) {
		props.onClick( user.email as string );
	}

	function renderPerson( user: Member ) {
		return (
			<PeopleListItemTransfer key={ user?.ID } user={ user } site={ site } onClick={ onClick } />
		);
	}

	function renderLoadingPeople() {
		return <PeopleListItemTransfer key="people-list-item-placeholder" />;
	}

	return (
		<>
			<Card className="people-team-members-list">
				{ isLoading && renderLoadingPeople() }
				<InfiniteList
					listkey={ listKey }
					items={ members }
					fetchNextPage={ fetchNextPage }
					fetchingNextPage={ isFetchingNextPage }
					lastPage={ ! hasNextPage }
					renderItem={ renderPerson }
					renderLoadingPlaceholders={ renderLoadingPeople }
					guessedItemHeight={ 126 }
					getItemRef={ getPersonRef }
				/>
			</Card>
		</>
	);
}

export default TeamMembersSiteTransfer;
