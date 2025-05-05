import { Card, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import InfiniteList from 'calypso/components/infinite-list';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { useSelector } from 'calypso/state';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import InfoIcon from './InfoIcon';
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
	const pendingInvitesEmails = pendingInvites
		?.filter( ( invite ) => invite.user?.email )
		.map( ( invite ) => invite.user?.email );

	const listKey = [ 'team-members', site?.ID, search ].join( '-' );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	const members = data?.users || [];

	// Filter out pending invites from the list of members and rendering then in order.
	// This helps to display the SSO message in the right place and don't show users in the list that are pending invites.
	const nonPendingMembersSorted = members
		.filter( ( member ) => ! pendingInvitesEmails?.includes( member?.email ) )
		.sort( ( a, b ) => {
			if ( a.linked_user_ID === false && b.linked_user_ID !== false ) {
				return 1;
			} else if ( a.linked_user_ID !== false && b.linked_user_ID === false ) {
				return -1;
			}
			return 0;
		} );

	// Calculated to understand where to render the SSO message.
	const firstNotConnectedUserIndex = nonPendingMembersSorted.findIndex(
		( obj ) => obj.linked_user_ID === false
	);

	const membersTotal = data?.total;
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

		return translate(
			'You have %(membersTotalCount)s user',
			'You have %(membersTotalCount)s users',
			{
				args: { membersTotalCount: formatNumber( membersTotal as number ) },
				count: membersTotal as number,
			}
		);
	}

	function renderSSOMessageWrapper( key: number, children: ReactElement ) {
		return (
			<div className="people-list-sso-message__wrapper" key={ key }>
				<div className="people-list-sso-message">
					<div className="people-list-sso-message__icon">
						<Icon icon={ InfoIcon } size={ 24 } />
					</div>
					<p>
						{ translate(
							'Invite the users below to join WordPress.com, so they can log in securely using {{a}}Secure Sign On.{{/a}}',
							{
								components: {
									a: (
										<a
											href={ localizeUrl( 'https://jetpack.com/support/sso/' ) }
											target="_blank"
											rel="noopener noreferrer"
										></a>
									),
								},
							}
						) }
					</p>
				</div>
				{ children }
			</div>
		);
	}

	function renderPerson( user: Member, index: number ) {
		const type = user.roles ? 'email' : 'viewer';

		if ( firstNotConnectedUserIndex === index ) {
			return renderSSOMessageWrapper(
				index,
				<PeopleListItem key={ user?.ID } user={ user } site={ site } type={ type } />
			);
		}
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
									{ translate( 'Add a user' ) }
								</Button>
							) }
						</PeopleListSectionHeader>
					) }
					<Card className="people-team-members-list">
						{ isLoading && renderLoadingPeople() }
						<InfiniteList
							listkey={ listKey }
							items={ nonPendingMembersSorted }
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
