import {
	activeAgencyQuery,
	agencyTeamMembersQuery,
	agencyTeamInvitesQuery,
	agencyTeamResendInviteMutation,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { agencyTeamRoute } from '../../app/router/agency';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useTeamActions, type TeamActionRequest } from './dataviews/actions';
import { DEFAULT_VIEW } from './dataviews/views';
import InviteTeamMemberModal from './invite-team-member-modal';
import TeamActionModal from './team-action-modal';
import TeamMembersContent from './team-members-content';
import type { TeamMember } from '@automattic/api-core';

const REMOVE_USERS_CAPABILITY = 'a4a_remove_users';

export default function AgencyTeam() {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const { data: activeAgency } = useQuery( activeAgencyQuery() );
	const agencyId = activeAgency?.id ?? 0;

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const searchParams = agencyTeamRoute.useSearch();
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'agency-team',
		defaultView: DEFAULT_VIEW,
		queryParams: searchParams,
	} );

	const { data: members = [], isLoading: isLoadingMembers } = useQuery(
		agencyTeamMembersQuery( agencyId )
	);
	const { data: invites = [], isLoading: isLoadingInvites } = useQuery(
		agencyTeamInvitesQuery( agencyId )
	);

	const allMembers = useMemo< TeamMember[] >(
		() => [ ...members, ...invites ],
		[ members, invites ]
	);

	const canRemove = !! activeAgency?.user?.capabilities?.includes( REMOVE_USERS_CAPABILITY );

	const [ activeRequest, setActiveRequest ] = useState< TeamActionRequest | null >( null );
	const [ isInviteOpen, setIsInviteOpen ] = useState( false );

	const { mutate: resendInvite } = useMutation( agencyTeamResendInviteMutation( agencyId ) );

	const onResendInvite = useCallback(
		( member: TeamMember ) => {
			recordTracksEvent( 'calypso_dashboard_team_resend_invite_click' );
			resendInvite( member.id, {
				onSuccess: () =>
					createSuccessNotice( __( 'The invitation has been resent.' ), { type: 'snackbar' } ),
				onError: () =>
					createErrorNotice( __( 'Failed to resend the invitation.' ), { type: 'snackbar' } ),
			} );
		},
		[ recordTracksEvent, resendInvite, createSuccessNotice, createErrorNotice ]
	);

	const actions = useTeamActions( {
		canRemove,
		currentUserEmail: user?.email,
		onResendInvite,
		onConfirmAction: setActiveRequest,
	} );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Team' ) }
					description={ __( 'Manage team members and invitations for your agency.' ) }
					actions={
						<Button
							variant="primary"
							__next40pxDefaultSize
							onClick={ () => {
								recordTracksEvent( 'calypso_dashboard_team_invite_member_click' );
								setIsInviteOpen( true );
							} }
						>
							{ __( 'Invite a team member' ) }
						</Button>
					}
				/>
			}
		>
			<TeamMembersContent
				members={ allMembers }
				actions={ actions }
				view={ view }
				onChangeView={ updateView }
				onReset={ resetView }
				isLoading={ isLoadingMembers || isLoadingInvites }
			/>
			{ activeRequest && (
				<TeamActionModal
					agencyId={ agencyId }
					agencyName={ activeAgency?.name ?? '' }
					request={ activeRequest }
					onClose={ () => setActiveRequest( null ) }
				/>
			) }
			{ isInviteOpen && (
				<InviteTeamMemberModal agencyId={ agencyId } onClose={ () => setIsInviteOpen( false ) } />
			) }
		</PageLayout>
	);
}
