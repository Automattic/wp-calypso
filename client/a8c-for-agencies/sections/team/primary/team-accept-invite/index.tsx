import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import { A4A_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useActivateMemberMutation, {
	APIError,
} from 'calypso/a8c-for-agencies/data/team/use-activate-member';
import AgencyLogo from 'calypso/assets/images/a8c-for-agencies/agency-logo.svg';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import NoMultiAgencyMessage from './no-multi-agency-message';

import './style.scss';

type Props = {
	agencyId?: number;
	inviteId?: number;
	secret?: string;
};

const ALREADY_MEMBER_OF_AGENCY_ERROR_CODE = 'a4a_user_invite_already_member_of_agency';

function ErrorMessage( { error }: { error: string } ) {
	return <div className="team-accept-invite__error">{ error }</div>;
}

export default function TeamAcceptInvite( { agencyId, inviteId, secret }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );

	const { mutate: activateMember } = useActivateMemberMutation();

	const [ error, setError ] = useState< APIError | null >( null );

	const hasCompleteParameters = agencyId && inviteId && secret;

	useEffect( () => {
		if ( hasCompleteParameters ) {
			setError( null );

			activateMember(
				{
					agencyId,
					inviteId,
					secret,
				},
				{
					onSuccess: () => {
						dispatch( fetchAgencies() );
					},
					onError: ( error: APIError ) => {
						setError( error );
					},
				}
			);
		}
	}, [ activateMember, agencyId, dispatch, hasCompleteParameters, inviteId, secret ] );

	useEffect( () => {
		if ( agency && agency.id === Number( agencyId ) ) {
			// If current agency is the same as the one in the URL, redirect to the overview page
			page( A4A_OVERVIEW_LINK );
		}
	}, [ agency, agencyId ] );

	const title = useMemo( () => {
		if ( error?.code === ALREADY_MEMBER_OF_AGENCY_ERROR_CODE ) {
			return <img src={ AgencyLogo } alt="" />;
		}

		return translate( 'Invalid invite link' );
	}, [ error, translate ] );

	const content = useMemo( () => {
		if ( ! error ) {
			return null;
		}

		if (
			error.code === ALREADY_MEMBER_OF_AGENCY_ERROR_CODE &&
			error.data?.user_agencies?.length &&
			error.data?.target_agency
		) {
			const currentAgency = error.data.user_agencies[ 0 ]; // Let's check only on the first agency.
			const targetAgency = error.data.target_agency;
			return <NoMultiAgencyMessage currentAgency={ currentAgency } targetAgency={ targetAgency } />;
		}

		return <ErrorMessage error={ error.message } />;
	}, [ error ] );

	if ( ! error ) {
		return <PagePlaceholder />;
	}

	return (
		<Layout className="team-accept-invite" title={ translate( 'Accepting team invite' ) } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>{ content }</LayoutBody>
		</Layout>
	);
}
