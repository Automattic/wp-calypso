import { useState } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
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
	search,
	currentPage,
	filter,
	sort,
}: DashboardOverviewContextInterface ) {
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const hasActiveKey = useSelector( hasActivePartnerKey );
	const [ isBulkManagementActive, setIsBulkManagementActive ] = useState( false );
	const [ selectedSites, setSelectedSites ] = useState< Site[] >( [] );

	if ( hasFetched && ! hasActiveKey ) {
		return <SelectPartnerKey />;
	}

	const handleSetBulkManagementActive = ( isActive: boolean ) => {
		setIsBulkManagementActive( isActive );
		if ( ! isActive ) {
			setSelectedSites( [] );
		}
	};

	if ( hasFetched ) {
		const context = {
			search,
			currentPage,
			filter,
			sort,
			isBulkManagementActive,
			setIsBulkManagementActive: handleSetBulkManagementActive,
			selectedSites,
			setSelectedSites,
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
