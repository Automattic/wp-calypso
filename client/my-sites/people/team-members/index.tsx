import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfiniteList from 'calypso/components/infinite-list';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { Member } from '../types';
import type { UsersQuery } from './types';

import './style.scss';

interface Props {
	search?: string;
	usersQuery: UsersQuery;
}
function TeamMembers( props: Props ) {
	const _ = useTranslate();
	const { search, usersQuery } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const listKey = [ 'team-members', site?.ID, search ].join( '-' );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	const members = data?.users || [];
	const membersTotal = data?.total;

	const addTeamMemberLink = `/people/new/${ site?.slug }`;

	function getPersonRef( user: Member ) {
		return 'user-' + user?.ID;
	}

	function getHeaderLabel() {
		const options = {
			args: { number: membersTotal, searchTerm: search },
			count: membersTotal as number,
		};

		if ( search && membersTotal ) {
			return _(
				'%(number)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
				'%(number)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
				{ ...options, components: { em: <em /> } }
			);
		}

		return _( 'You have %(number)d team member', 'You have %(number)d team members', options );
	}

	function renderPerson( user: Member ) {
		const type = user.roles ? 'email' : 'viewer';

		return <PeopleListItem key={ user?.ID } user={ user } site={ site } type={ type } />;
	}

	function renderLoadingPeople() {
		return <PeopleListItem key="people-list-item-placeholder" />;
	}

	let templateState;
	if ( isLoading ) {
		templateState = 'loading';
	} else if ( search && ! membersTotal ) {
		templateState = 'no-result';
	} else if ( ! membersTotal ) {
		templateState = 'empty';
	} else {
		templateState = 'default';
	}

	switch ( templateState ) {
		case 'default':
		case 'loading':
			return (
				<>
					<PeopleListSectionHeader isPlaceholder={ isLoading } label={ getHeaderLabel() }>
						<Button compact primary href={ addTeamMemberLink }>
							{ _( 'Add a team member' ) }
						</Button>
					</PeopleListSectionHeader>
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

		case 'no-result':
			return (
				<Card>
					<NoResults
						image="/calypso/images/people/mystery-person.svg"
						text={ _( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
							args: { searchTerm: search },
							components: { em: <em /> },
						} ) }
					/>
				</Card>
			);
	}
	return null;
}

export default TeamMembers;
