import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import accept from 'calypso/lib/accept';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { useDispatch, useSelector } from 'calypso/state';
import { deleteInvites } from 'calypso/state/invites/actions';
import { getAcceptedInvitesForSite, isDeletingAnyInvite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { Invite } from '../team-invites/types';

import './style.scss';

function TeamInvitesAccepted() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const siteId = site?.ID as number;
	const isDeleting = useSelector( ( state ) => isDeletingAnyInvite( state, siteId ) );
	const acceptedInvites = useSelector( ( state ) => getAcceptedInvitesForSite( state, siteId ) );

	function onClearAll() {
		showPrompt();
	}

	function showPrompt() {
		accept(
			<div>
				<h1>{ translate( 'Clear All Accepted' ) }</h1>
				<p>{ translate( 'Are you sure you wish to clear all accepted invites?' ) }</p>
			</div>,
			( accepted: boolean ) => {
				if ( ! accepted ) {
					return;
				}

				const ids = acceptedInvites ? acceptedInvites?.map( ( x ) => x.key ) : [];
				dispatch( deleteInvites( siteId, ids ) );
			},
			translate( 'Clear all' )
		);
	}

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
			<QuerySiteInvites siteId={ siteId } />
			{ !! acceptedInvites?.length && (
				<>
					<PeopleListSectionHeader
						label={ translate(
							'%(numberPeople)d user has accepted your invite',
							'%(numberPeople)d users have accepted your invites',
							{
								args: {
									numberPeople: acceptedInvites?.length,
								},
								count: acceptedInvites ? acceptedInvites?.length : 0,
							}
						) }
					>
						<Button compact busy={ isDeleting } onClick={ onClearAll }>
							{ translate( 'Clear all invites' ) }
						</Button>
					</PeopleListSectionHeader>
					<Card className="people-team-invites-accepted-list">
						{ acceptedInvites?.map( renderInvite ) }
					</Card>
				</>
			) }
		</>
	);
}

export default TeamInvitesAccepted;
