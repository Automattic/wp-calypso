import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import useGetInvitesQuery from 'calypso/data/invites/use-get-invites-query';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { Invite } from './types';

import './style.scss';

function TeamInvites() {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const siteId = site?.ID as number;
	const pendingInvites = useSelector( ( state ) => getPendingInvitesForSite( state, siteId ) );

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
							'You have a pending invite for %(number)d user',
							'You have a pending invite for %(number)d users',
							{
								args: { number: pendingInvites?.length },
								count: pendingInvites?.length as number,
							}
						) }
					/>
					<Card className="people-team-invites-list">{ pendingInvites?.map( renderInvite ) }</Card>
				</>
			) }
		</>
	);
}

export default TeamInvites;
