import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { A4A_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useActivateMemberMutation from 'calypso/a8c-for-agencies/data/team/use-activate-member';
import AgencyLogo from 'calypso/assets/images/a8c-for-agencies/agency-logo.svg';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency, hasFetchedAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import NoMultiAgencyMessage from './no-multi-agency-message';

import './style.scss';

type Props = {
	agencyId?: number;
	agencyName?: string;
	inviteId?: number;
	secret?: string;
};

function PlaceHolder() {
	return (
		<div className="team-accept-invite__section-placeholder">
			<div className="team-accept-invite__section-placeholder-title"></div>
			<div className="team-accept-invite__section-placeholder-body"></div>
			<div className="team-accept-invite__section-placeholder-footer"></div>
		</div>
	);
}

function ErrorMessage( { error }: { error: string } ) {
	return <div className="team-accept-invite__error">{ error }</div>;
}

export default function TeamAcceptInvite( { agencyId, agencyName, inviteId, secret }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const currentAgency = useSelector( getActiveAgency );
	const isAgencyFetched = useSelector( hasFetchedAgency );

	const { mutate: activateMember } = useActivateMemberMutation();

	const [ error, setError ] = useState( '' );

	const isMemberOfAnotherAgency = currentAgency && currentAgency.id !== Number( agencyId );

	const hasCompleteParameters = agencyId && inviteId && secret;

	useEffect( () => {
		if ( ! isAgencyFetched ) {
			return;
		}

		if ( hasCompleteParameters ) {
			setError( '' );

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
					onError: ( error ) => {
						setError( error.message );
					},
				}
			);
		}
	}, [
		activateMember,
		agencyId,
		dispatch,
		hasCompleteParameters,
		inviteId,
		isAgencyFetched,
		secret,
	] );

	useEffect( () => {
		if ( currentAgency && currentAgency.id === Number( agencyId ) ) {
			// If current agency is the same as the one in the URL, redirect to the overview page
			page( A4A_OVERVIEW_LINK );
		}
	}, [ currentAgency, agencyId ] );

	const title = useMemo( () => {
		if ( isAgencyFetched && isMemberOfAnotherAgency && hasCompleteParameters ) {
			return <img src={ AgencyLogo } alt="" />;
		}

		if ( error ) {
			return translate( 'Invalid invite link' );
		}

		return <div className="team-accept-invite__title-placeholder"></div>;
	}, [ error, hasCompleteParameters, isAgencyFetched, isMemberOfAnotherAgency, translate ] );

	const content = useMemo( () => {
		if ( isAgencyFetched && isMemberOfAnotherAgency && hasCompleteParameters ) {
			return (
				<NoMultiAgencyMessage
					currentAgency={ currentAgency }
					invitingAgencyName={ agencyName ?? translate( 'Agency' ) }
				/>
			);
		}

		if ( error ) {
			return <ErrorMessage error={ error } />;
		}

		return <PlaceHolder />;
	}, [
		agencyName,
		currentAgency,
		error,
		hasCompleteParameters,
		isAgencyFetched,
		isMemberOfAnotherAgency,
		translate,
	] );

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
