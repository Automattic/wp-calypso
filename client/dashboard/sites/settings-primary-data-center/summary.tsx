import { getDataCenterOptions, HostingFeatures } from '@automattic/api-core';
import { sitePrimaryDataCenterQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import type { DataCenterOption, Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SettingsPrimaryDataCenterSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ),
	} );

	const dataCenterOptions = getDataCenterOptions();
	const primaryDataCenterName = primaryDataCenter
		? dataCenterOptions[ primaryDataCenter as DataCenterOption ]
		: null;

	if ( ! primaryDataCenterName ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/primary-data-center` }
			title={ __( 'Primary data center' ) }
			density={ density }
			decoration={ <Icon icon={ cloud } /> }
			badges={ [ { text: primaryDataCenterName } ] }
		/>
	);
}
