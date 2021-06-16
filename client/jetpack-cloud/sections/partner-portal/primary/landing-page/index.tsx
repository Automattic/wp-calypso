/**
 * External dependencies
 */
import React, { useEffect, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { LicenseCounts } from 'calypso/state/partner-portal/types';
import {
	hasFetchedLicenseCounts,
	getLicenseCounts,
} from 'calypso/state/partner-portal/licenses/selectors';
import QueryJetpackPartnerPortalLicenseCounts from 'calypso/components/data/query-jetpack-partner-portal-license-counts';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';

const getTotalCount = ( counts: LicenseCounts ): number => {
	return Object.values( counts ).reduce( ( acc, count ) => {
		if ( typeof count !== 'number' ) return acc;

		return acc + count;
	} );
};

export default function LandingPage(): ReactElement | null {
	const translate = useTranslate();
	const counts = useSelector( getLicenseCounts );
	const hasFetched = useSelector( hasFetchedLicenseCounts );
	const totalCount = getTotalCount( counts );

	useEffect( () => {
		if ( ! hasFetched ) {
			return;
		}

		if ( totalCount > 0 ) {
			return page.redirect( '/partner-portal/billing' );
		}

		return page.redirect( '/partner-portal/licenses' );
	}, [ totalCount, hasFetched ] );

	return (
		<Main className="landing-page__partner-portal">
			<QueryJetpackPartnerPortalLicenseCounts />

			<CardHeading size={ 36 }>{ translate( 'Partner Portal' ) }</CardHeading>

			{ ! hasFetched && <Spinner /> }
		</Main>
	);
}
