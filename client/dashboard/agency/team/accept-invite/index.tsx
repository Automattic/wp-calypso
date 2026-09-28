import { activeAgencyQuery, agencyTeamActivateMemberMutation } from '@automattic/api-queries';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../app/context';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import NoMultiAgencyMessage from './no-multi-agency-message';
import type { AgencyTeamInviteActivationError } from '@automattic/api-core';

import './style.scss';

const ALREADY_MEMBER_OF_AGENCY_ERROR_CODE = 'a4a_user_invite_already_member_of_agency';

// The endpoint's own errors are untranslated strings, and a link whose agency,
// invite or secret no longer matches only gets the generic `rest_invalid_param`
// text, so the known cases get copy of our own.
function getErrorMessage( error: AgencyTeamInviteActivationError ) {
	switch ( error.code ) {
		case 'rest_invalid_param':
			return __(
				'This invite is no longer valid. It may have been used, cancelled, or replaced by a newer one. Ask the agency to send you a new invite.'
			);
		case 'a4a_user_invite_expired':
			return __( 'This invite has expired. Ask the agency to send you a new one.' );
		default:
			return error.message;
	}
}

function AcceptInviteScreen( { children }: { children: React.ReactNode } ) {
	const { Logo } = useAppContext();

	return (
		<div className="team-accept-invite">
			<HStack className="team-accept-invite-top-bar" justify="flex-start">
				{ Logo && <Logo /> }
			</HStack>
			<PageLayout size="small" header={ <PageHeader title={ __( 'Accept team invite' ) } /> }>
				{ children }
			</PageLayout>
		</div>
	);
}

function AcceptInviteWaiting() {
	const { LoadingLogo = WordPressLogo } = useAppContext();

	return <LoadingLogo className="wpcom-site__logo" />;
}

export default function AcceptTeamInvite( {
	agencyId,
	inviteId,
	secret,
}: {
	agencyId?: number;
	inviteId?: number;
	secret?: string;
} ) {
	const navigate = useNavigate();
	const { data: activeAgency, isFetched: hasCheckedAgency } = useQuery( activeAgencyQuery() );
	const { mutate: activateMember } = useMutation( agencyTeamActivateMemberMutation() );
	const [ error, setError ] = useState< AgencyTeamInviteActivationError | null >( null );
	const hasActivated = useRef( false );

	// A member of this agency, for example opening the link again after
	// accepting, goes to Overview whatever the invite's state.
	const isAlreadyInThisAgency = !! agencyId && activeAgency?.id === agencyId;

	useEffect( () => {
		if ( isAlreadyInThisAgency ) {
			navigate( { to: '/overview', replace: true } );
		}
	}, [ isAlreadyInThisAgency, navigate ] );

	useEffect( () => {
		if (
			! agencyId ||
			! inviteId ||
			! secret ||
			! hasCheckedAgency ||
			isAlreadyInThisAgency ||
			hasActivated.current
		) {
			return;
		}

		hasActivated.current = true;
		activateMember(
			{ agencyId, inviteId, secret },
			{
				onSuccess: () => {
					navigate( { to: '/overview', replace: true } );
				},
				onError: ( activationError ) =>
					setError( activationError as AgencyTeamInviteActivationError ),
			}
		);
	}, [
		activateMember,
		agencyId,
		hasCheckedAgency,
		inviteId,
		isAlreadyInThisAgency,
		navigate,
		secret,
	] );

	if ( isAlreadyInThisAgency ) {
		return <AcceptInviteWaiting />;
	}

	if ( error?.code === ALREADY_MEMBER_OF_AGENCY_ERROR_CODE ) {
		const currentAgency = error.data?.user_agencies?.[ 0 ];
		const targetAgency = error.data?.target_agency;

		if ( currentAgency && targetAgency ) {
			return (
				<AcceptInviteScreen>
					<NoMultiAgencyMessage currentAgency={ currentAgency } targetAgency={ targetAgency } />
				</AcceptInviteScreen>
			);
		}
	}

	if ( error ) {
		return (
			<AcceptInviteScreen>
				<Notice variant="error" title={ __( 'Invalid invite link' ) }>
					<Text>{ getErrorMessage( error ) }</Text>
				</Notice>
			</AcceptInviteScreen>
		);
	}

	if ( ! agencyId || ! inviteId || ! secret ) {
		return (
			<AcceptInviteScreen>
				<Notice variant="error" title={ __( 'Invalid invite link' ) }>
					<Text>
						{ __(
							'This link is incomplete. Open the link in your invite email again, or ask the agency to send you a new invite.'
						) }
					</Text>
				</Notice>
			</AcceptInviteScreen>
		);
	}

	return <AcceptInviteWaiting />;
}
