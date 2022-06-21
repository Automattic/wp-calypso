import config from '@automattic/calypso-config';
import page from 'page';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	hasFetchedPartner,
	isFetchingPartner,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';
import { getPreference } from 'calypso/state/preferences/selectors';
import { JETPACK_AGENCY_DASHBOARD_DEFAULT_FILTER_CLEARED_KEY } from './agency-dashboard/sites-overview/utils';

import '../style.scss';

export default function SiteLanding( { primarySiteSlug, isPrimarySiteJetpackSite } ) {
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const isDefaultFilterCleared = useSelector( ( state ) =>
		getPreference( state, JETPACK_AGENCY_DASHBOARD_DEFAULT_FILTER_CLEARED_KEY )
	);
	const isAgency = useSelector( isAgencyUser );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	useEffect( () => {
		if ( hasFetched ) {
			if ( isAgency && isAgencyEnabled ) {
				page.redirect(
					isDefaultFilterCleared ? '/dashboard' : '/dashboard?issue_types=all_issues'
				);
				return;
			}
			isPrimarySiteJetpackSite ? page( `/landing/${ primarySiteSlug }` ) : page( `/landing` );
		}
	}, [
		primarySiteSlug,
		hasFetched,
		isPrimarySiteJetpackSite,
		isAgency,
		isAgencyEnabled,
		isDefaultFilterCleared,
	] );

	return <>{ isFetching ? <JetpackLogo size={ 72 } className="sections__logo" /> : null }</>;
}
