import config from '@automattic/calypso-config';
import page from 'page';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Spinner from 'calypso/components/spinner';
import { isAgencyUser } from 'calypso/lib/partner/utils';
import {
	hasFetchedPartner,
	getCurrentPartner,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';

export default function SiteLanding( { primarySiteSlug, isPrimarySiteJetpackSite } ) {
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const isAgency = isAgencyUser( partner );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	useEffect( () => {
		if ( hasFetched ) {
			if ( isAgency && isAgencyEnabled ) {
				page.redirect( '/dashboard' );
				return;
			}
			isPrimarySiteJetpackSite ? page( `/landing/${ primarySiteSlug }` ) : page( `/landing` );
		}
	}, [ primarySiteSlug, hasFetched, isPrimarySiteJetpackSite, isAgency, isAgencyEnabled ] );

	return <>{ isFetching ? <Spinner /> : null }</>;
}
