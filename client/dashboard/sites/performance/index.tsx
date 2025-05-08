import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DeviceTabControls, { ToggleType } from './device-toggle';
import Report from './report';

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data } = useQuery( siteQuery( siteSlug ) );
	const [ deviceTab, setDeviceTab ] = useState< ToggleType >( 'desktop' );

	if ( ! data ) {
		return null;
	}

	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Performance' ) }
				actions={ <DeviceTabControls value={ deviceTab } onChange={ setDeviceTab } /> }
			/>
			<Report site={ data.site } deviceType={ deviceTab } />
		</PageLayout>
	);
}

export default SitePerformance;
