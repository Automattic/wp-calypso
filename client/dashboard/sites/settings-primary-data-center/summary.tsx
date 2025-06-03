import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import { getDataCenterOptions } from 'calypso/data/data-center';
import { sitePrimaryDataCenterQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canGetPrimaryDataCenter } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export function useCanRenderSettingsPrimaryDataCenterSummary( { site }: { site: Site } ) {
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( site.slug ),
		enabled: canGetPrimaryDataCenter( site ),
	} );

	const dataCenterOptions = getDataCenterOptions();
	const primaryDataCenterName = primaryDataCenter ? dataCenterOptions[ primaryDataCenter ] : null;

	return {
		show: !! primaryDataCenterName,
		props: {
			site,
			primaryDataCenterName: primaryDataCenterName as string,
		},
	};
}

export default function SettingsPrimaryDataCenterSummary( {
	site,
	primaryDataCenterName,
	density,
}: ReturnType< typeof useCanRenderSettingsPrimaryDataCenterSummary >[ 'props' ] & {
	density?: Density;
} ) {
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
