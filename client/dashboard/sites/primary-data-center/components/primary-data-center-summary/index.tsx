import { getDataCenterOptions } from '@automattic/api-core';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../../../components/router-link-summary-button';
import { useHostedDataCenter } from '../../hosted-data-center';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SettingsPrimaryDataCenterSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { current } = useHostedDataCenter( site );

	if ( ! current ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/primary-data-center` }
			title={ __( 'Primary data center' ) }
			density={ density }
			decoration={ <Icon icon={ cloud } /> }
			badges={ [ { text: getDataCenterOptions()[ current ] } ] }
		/>
	);
}
