/**
 * External dependencies
 */
import React, { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getQueryArg } from '@wordpress/url';
import page from 'page';

/**
 * Internal dependencies
 */
import { PartnerKey } from 'calypso/state/partner-portal/types';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { ensurePartnerPortalReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';

export default function PartnerAccess(): ReactElement | null {
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const keys = ( partner?.keys || [] ) as PartnerKey[];
	const hasPartner = hasFetched && ! isFetching && keys.length > 0;
	const showError = hasFetched && ! isFetching && keys.length === 0;

	useEffect( () => {
		if ( hasPartner ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl = ensurePartnerPortalReturnUrl( returnQuery );

			page.redirect( returnUrl );
		}
	}, [ hasPartner ] );

	return (
		<Main className="partner-access">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Partner Portal' ) }</CardHeading>

			{ isFetching && <Spinner /> }

			{ showError && (
				<div className="partner-access__error">
					<p>{ translate( 'Your account is not registered as a partner account.' ) }</p>

					<Button href="/" primary>
						{ translate( 'Manage Sites' ) }
					</Button>
				</div>
			) }
		</Main>
	);
}
