import { useState } from 'react';
import { useQueryJetpackPartnerPortalPartner } from 'calypso/components/data/query-jetpack-partner-portal-partner';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
import { useSelector } from 'calypso/state';
import {
	hasActivePartnerKey,
	hasFetchedPartner,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import SitesOverview from '../sites-overview';
import SitesOverviewContext from '../sites-overview/context';
import type { DashboardOverviewContextInterface, Site } from '../sites-overview/types';

import '../style.scss';

export default function DashboardOverview( {
	path,
	search,
	currentPage,
	filter,
	sort,
}: DashboardOverviewContextInterface ) {
	useQueryJetpackPartnerPortalPartner();

	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const hasActiveKey = useSelector( hasActivePartnerKey );
	const [ isBulkManagementActive, setIsBulkManagementActive ] = useState( false );
	const [ selectedSites, setSelectedSites ] = useState< Site[] >( [] );
	const [ currentLicenseInfo, setCurrentLicenseInfo ] = useState< string | null >( null );
	const [ mostRecentConnectedSite, setMostRecentConnectedSite ] = useState< string | null >( null );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	if ( hasFetched && ! hasActiveKey ) {
		return <SelectPartnerKey />;
	}

	const handleSetBulkManagementActive = ( isActive: boolean ) => {
		setIsBulkManagementActive( isActive );
		if ( ! isActive ) {
			setSelectedSites( [] );
		}
	};

	const onShowLicenseInfo = ( license: string ) => {
		setCurrentLicenseInfo( license );
	};

	const onHideLicenseInfo = () => {
		setCurrentLicenseInfo( null );
	};

	if ( hasFetched ) {
		const context = {
			path,
			search,
			currentPage,
			filter,
			sort,
			isBulkManagementActive,
			setIsBulkManagementActive: handleSetBulkManagementActive,
			selectedSites,
			setSelectedSites,
			currentLicenseInfo,
			showLicenseInfo: onShowLicenseInfo,
			hideLicenseInfo: onHideLicenseInfo,
			mostRecentConnectedSite,
			setMostRecentConnectedSite,
			isPopoverOpen,
			setIsPopoverOpen,
		};
		return (
			<SitesOverviewContext.Provider value={ context }>
				<SitesOverview />
			</SitesOverviewContext.Provider>
		);
	}

	return (
		<>{ isFetching ? <JetpackLogo size={ 72 } className="dashboard-overview__logo" /> : null }</>
	);
}
