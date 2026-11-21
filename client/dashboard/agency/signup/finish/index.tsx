import { agencyCreateMutation, agencyQuery } from '@automattic/api-queries';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import cookie from 'cookie';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useAppContext } from '../../../app/context';
import Notice, { NoticeActionLinkButton } from '../../../components/notice';
import {
	clearSignupDataFromLocalStorage,
	getSignupTracksProps,
	type SignupData,
} from './signup-data';

import './style.scss';

function getHubspotutk() {
	return cookie.parse( document.cookie ).hubspotutk;
}

function SignupFinishError( { message }: { message: string } ) {
	return (
		<VStack className="agency-signup-finish" alignment="center" justify="center">
			<Notice
				variant="error"
				title={ __( 'We couldn’t create your agency' ) }
				actions={
					<NoticeActionLinkButton href="/signup">
						{ __( 'Back to sign up' ) }
					</NoticeActionLinkButton>
				}
			>
				{ message }
			</Notice>
		</VStack>
	);
}

export default function AgencySignupFinish( { signupData }: { signupData: SignupData } ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { LoadingLogo = WordPressLogo } = useAppContext();
	const { data: agency, error: agencyError } = useQuery( agencyQuery() );
	const { mutate: createAgency, error: createError } = useMutation( agencyCreateMutation() );
	const hasSubmitted = useRef( false );

	const hasAgency = !! agency?.hasAgency;

	useEffect( () => {
		if ( hasAgency ) {
			navigate( { to: '/overview', replace: true } );
		}
	}, [ hasAgency, navigate ] );

	useEffect( () => {
		if ( ! agency || agency.hasAgency || hasSubmitted.current ) {
			return;
		}

		hasSubmitted.current = true;
		recordTracksEvent(
			'calypso_a4a_create_agency_finish_submit',
			getSignupTracksProps( signupData )
		);
		createAgency(
			{ ...signupData.request, hubspotutk: getHubspotutk() },
			{
				onSuccess: () => {
					clearSignupDataFromLocalStorage();
					navigate( { to: '/overview', replace: true } );
				},
			}
		);
	}, [ agency, createAgency, navigate, recordTracksEvent, signupData ] );

	const error = createError ?? agencyError;
	if ( error ) {
		return <SignupFinishError message={ error.message } />;
	}

	return (
		<VStack className="agency-signup-finish" alignment="center" justify="center" spacing={ 12 }>
			<LoadingLogo className="agency-signup-finish-logo" />
			<Heading level={ 1 } size={ 32 } align="center">
				{ __( 'Please give us a minute to customize your experience…' ) }
			</Heading>
		</VStack>
	);
}
