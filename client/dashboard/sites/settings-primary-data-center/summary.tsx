import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import { getDataCenterOptions } from 'calypso/data/data-center';
import { sitePrimaryDataCenterQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canGetPrimaryDataCenter } from './index';
import type { Site } from '../../data/types';

export default function SettingsPrimaryDataCenterSummary( { site }: { site: Site } ) {
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( site.slug ),
		enabled: canGetPrimaryDataCenter( site ),
	} );

	const dataCenterOptions = getDataCenterOptions();
	const primaryDataCenterName =
		dataCenterOptions[ primaryDataCenter as keyof typeof dataCenterOptions ];

	const badge = {
		text: primaryDataCenterName ?? __( 'Managed' ),
		intent: 'success' as const,
	};

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/primary-data-center` }
			title={ __( 'Primary data center' ) }
			density="medium"
			decoration={ <Icon icon={ cloud } /> }
			badges={ [ badge ] }
		/>
	);
}
