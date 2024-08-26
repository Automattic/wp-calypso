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
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

import './style.scss';

type Props = {
	agencyId?: number;
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

export default function TeamAcceptInvite( { agencyId, inviteId, secret }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );

	const { mutate: activateMember } = useActivateMemberMutation();

	const [ error, setError ] = useState( '' );

	useEffect( () => {
		// FIXME: Check if current user is not member of any agency. If so, display some instructions on how to join to the new agency.

		if ( agencyId && inviteId && secret ) {
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
	}, [ activateMember, agencyId, dispatch, inviteId, secret ] );

	useEffect( () => {
		if ( agency && agency.id === agencyId ) {
			// If current agency is the same as the one in the URL, redirect to the overview page
			page( A4A_OVERVIEW_LINK );
		}
	}, [ agency, agencyId ] );

	const title = translate( 'Accepting team invite' );

	const content = useMemo( () => {
		if ( error ) {
			return <ErrorMessage error={ error } />;
		}

		return <PlaceHolder />;
	}, [ error ] );

	return (
		<Layout className="team-accept-invite" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>
						{ error ? (
							translate( 'Invalid invite link' )
						) : (
							<div className="team-accept-invite__title-placeholder"></div>
						) }
					</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>{ content }</LayoutBody>
		</Layout>
	);
}
