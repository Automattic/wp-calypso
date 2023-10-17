import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../hooks';
import SitesOverviewContext from '../sites-overview/context';
import type { SiteData } from '../sites-overview/types';

import './style.scss';

interface Props {
	sites: Array< SiteData >;
	isLargeScreen?: boolean;
	isLoading: boolean;
}

export default function EditButton( { sites, isLargeScreen, isLoading }: Props ) {
	const translate = useTranslate();

	const { setIsBulkManagementActive, setSelectedSites } = useContext( SitesOverviewContext );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, isLargeScreen );

	const handleToggleSelect = () => {
		// Filter sites with site error or monitor error or is Atomic site as they are not selectable.
		const filteredSite = sites.filter(
			( site ) =>
				site.site.value.is_connected && ! site.monitor.error && ! site.site.value.is_atomic
		);
		setSelectedSites( filteredSite.map( ( item ) => item.site.value ) );
	};

	const handleEditAll = () => {
		recordEvent( 'edit_all_click' );
		setIsBulkManagementActive( true );
		handleToggleSelect();
	};

	return (
		<ButtonGroup>
			<Button
				className="dashboard-bulk-actions__edit-button"
				compact
				onClick={ handleEditAll }
				disabled={ isLoading }
			>
				{ translate( 'Edit All', { context: 'button label' } ) }
			</Button>
		</ButtonGroup>
	);
}
