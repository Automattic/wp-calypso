import { Button, Card, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useGetInvitesQuery from 'calypso/data/invites/use-get-invites-query';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { useSelector } from 'calypso/state';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { Invite } from './types';

import './style.scss';

interface Props {
	singleInviteView?: boolean;
}

function TeamInvites( props: Props ) {
	const translate = useTranslate();
	const { singleInviteView } = props;
	const site = useSelector( getSelectedSite );
	const siteId = site?.ID as number;
	const pendingInvites = useSelector( ( state ) => getPendingInvitesForSite( state, siteId ) );
	const addTeamMemberLink = `/people/new/${ site?.slug }`;
	const viewAllPendingInvitesLink = `/people/pending-invites/${ site?.slug }`;

	useGetInvitesQuery( siteId );

	function renderInvite( invite: Invite ) {
		const user = invite.user;

		return (
			<PeopleListItem
				key={ invite.key }
				invite={ invite }
				user={ user }
				site={ site }
				type="invite"
				isSelectable={ false }
			/>
		);
	}

	return (
		<>
			{ !! pendingInvites?.length && (
				<>
					<PeopleListSectionHeader
						label={ translate(
							'You have %(number)d pending invite',
							'You have %(number)d pending invites',
							{
								args: { number: pendingInvites?.length },
								count: pendingInvites?.length as number,
							}
						) }
					>
						{ singleInviteView && (
							<Button compact primary href={ addTeamMemberLink }>
								{ translate( 'Add a team member' ) }
							</Button>
						) }
					</PeopleListSectionHeader>
					{ ! singleInviteView && (
						<Card className="people-team-invites-list">
							{ pendingInvites?.map( renderInvite ) }
						</Card>
					) }
					{ singleInviteView && (
						<>
							<Card className="people-team-invites-list people-team-invites-list-single-view">
								{ renderInvite( pendingInvites?.[ 0 ] ) }
								{ pendingInvites.length > 1 && (
									<CompactCard
										className="people-list-item-view-all"
										href={ viewAllPendingInvitesLink }
									>
										{ translate( 'View all' ) }
									</CompactCard>
								) }
							</Card>
						</>
					) }
				</>
			) }
		</>
	);
}

export default TeamInvites;
