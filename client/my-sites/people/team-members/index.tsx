import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InfiniteList from 'calypso/components/infinite-list';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { useSelector } from 'calypso/state';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { UsersQuery, Member } from '@automattic/data-stores';

import './style.scss';

interface Props {
	search?: string;
	usersQuery: UsersQuery;
	showAddTeamMembersBtn?: boolean;
	showHeader?: boolean;
}
function TeamMembers( props: Props ) {
	const translate = useTranslate();
	const { search, usersQuery, showAddTeamMembersBtn = true, showHeader = true } = props;
	const site = useSelector( getSelectedSite );
	const siteId = site?.ID as number;

	const pendingInvites = useSelector( ( state ) => getPendingInvitesForSite( state, siteId ) );
	const pendingInvitesMails = pendingInvites?.map( ( invite ) => invite.user?.email );

	const listKey = [ 'team-members', site?.ID, search ].join( '-' );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	const members = data?.users || [];

	const nonPendingMembers = members.filter(
		( member ) => ! pendingInvitesMails?.includes( member?.email )
	);

	const membersTotal = nonPendingMembers.length;
	const addTeamMemberLink = `/people/new/${ site?.slug }`;

	function getPersonRef( user: Member ) {
		return 'user-' + user?.ID;
	}

	function getHeaderLabel() {
		if ( search && membersTotal ) {
			return translate(
				'%(number)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
				'%(number)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
				{
					args: { number: membersTotal, searchTerm: search },
					count: membersTotal as number,
					components: { em: <em /> },
				}
			);
		}

		return translate( 'You have %(number)d team member', 'You have %(number)d team members', {
			args: { number: membersTotal as number, searchTerm: search as string },
			count: membersTotal as number,
		} );
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
					{ showHeader && (
						<PeopleListSectionHeader isPlaceholder={ isLoading } label={ getHeaderLabel() }>
							{ showAddTeamMembersBtn && (
								<Button compact primary href={ addTeamMemberLink }>
									{ translate( 'Add a team member' ) }
								</Button>
							) }
						</PeopleListSectionHeader>
					) }
					<Card className="people-team-members-list">
						{ isLoading && renderLoadingPeople() }
						<InfiniteList
							listkey={ listKey }
							items={ nonPendingMembers }
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
						text={ translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
							args: { searchTerm: search as string },
							components: { em: <em /> },
						} ) }
					/>
				</Card>
			);
	}
	return null;
}

export default TeamMembers;
