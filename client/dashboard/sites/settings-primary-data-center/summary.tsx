import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import { getDataCenterOptions } from 'calypso/data/data-center';
import { sitePrimaryDataCenterQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canGetPrimaryDataCenter } from './index';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SettingsPrimaryDataCenterSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( site.slug ),
		enabled: canGetPrimaryDataCenter( site ),
	} );

	const dataCenterOptions = getDataCenterOptions();
	const primaryDataCenterName = primaryDataCenter ? dataCenterOptions[ primaryDataCenter ] : null;

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
