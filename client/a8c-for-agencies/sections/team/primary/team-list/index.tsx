import { getCurrentUser } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_TEAM_INVITE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useTeamActions } from 'calypso/dashboard/agency/team/dataviews/actions';
import { DEFAULT_VIEW } from 'calypso/dashboard/agency/team/dataviews/views';
import TeamMembersContent from 'calypso/dashboard/agency/team/team-members-content';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useHandleMemberAction from '../../hooks/use-handle-member-action';
import { useMemberList } from '../../hooks/use-member-list';
import GetStarted from '../get-started';
import TeamActionDialog, { type TeamActionRequest } from './team-action-dialog';
import type { TeamMember } from '../../types';
import type { View } from '@wordpress/dataviews';

import './style.scss';

export default function TeamList() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { activeMembers, invitedMembers, hasMembers, isPending, refetch } = useMemberList();

	const isDesktop = useDesktopBreakpoint();
	const title = isDesktop ? translate( 'Manage team members' ) : translate( 'Team' );

	const [ view, setView ] = useState< View >( () => ( { ...DEFAULT_VIEW } ) );
	const [ activeRequest, setActiveRequest ] = useState< TeamActionRequest | null >( null );

	const canRemove = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_remove_users' )
	);
	const currentUser = useSelector( getCurrentUser );

	const handleMemberAction = useHandleMemberAction( { onRefetchList: refetch } );

	const onResendInvite = useCallback(
		( member: TeamMember ) => handleMemberAction( 'resend-user-invite', member ),
		[ handleMemberAction ]
	);

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
		page( A4A_TEAM_INVITE_LINK );
	};

	const actions = useTeamActions( {
		canRemove,
		currentUserEmail: currentUser?.email,
		onResendInvite,
		onConfirmAction: setActiveRequest,
	} );

	const members = useMemo(
		(): TeamMember[] => [ ...activeMembers, ...invitedMembers ],
		[ activeMembers, invitedMembers ]
	);

	if ( isPending ) {
		return <PagePlaceholder />;
	}

	if ( ! hasMembers ) {
		return <GetStarted />;
	}

	return (
		<Layout className="team-list full-width-layout-with-table" title={ title } wide>
			<LayoutTop isFullWidth>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" onClick={ onInviteClick }>
							{ translate( 'Invite a team member' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="redesigned-a8c-table">
					<TeamMembersContent
						members={ members }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						onReset={ () => setView( { ...DEFAULT_VIEW } ) }
					/>
				</div>
			</LayoutBody>

			{ activeRequest && (
				<TeamActionDialog
					request={ activeRequest }
					onClose={ () => setActiveRequest( null ) }
					onRefresh={ refetch }
				/>
			) }
		</Layout>
	);
}
