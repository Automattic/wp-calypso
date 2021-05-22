/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PartnerKey } from 'calypso/state/partner-portal/types';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import { useReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';

export default function PartnerAccess(): ReactElement | null {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const keys = ( partner?.keys || [] ) as PartnerKey[];
	const hasPartner = hasFetched && ! isFetching && keys.length > 0;
	const showError = hasFetched && ! isFetching && keys.length === 0;

	const onManageSitesClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_partner_access_error_manage_sites_click' )
		);
	};

	useReturnUrl( hasPartner );

	return (
		<Main className="partner-access">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Partner Portal' ) }</CardHeading>

			{ isFetching && <Spinner /> }

			{ showError && (
				<div className="partner-access__error">
					<p>{ translate( 'Your account is not registered as a partner account.' ) }</p>

					<Button href="/" onClick={ onManageSitesClick } primary>
						{ translate( 'Manage Sites' ) }
					</Button>
				</div>
			) }
		</Main>
	);
}
