import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import BranchIcon from '../deployments/icons/branch';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function RepositoriesSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	if ( isDashboardBackport() ) {
		return null;
	}
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/repositories` }
			title={ __( 'Repositories' ) }
			density={ density }
			decoration={ <BranchIcon width={ 22 } height={ 22 } style={ { opacity: 0.95 } } /> }
		/>
	);
}
