import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { getSiteSettingsRepositoriesURL } from '../../utils/site-url';
import GithubIcon from '../deployments/icons/github';
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
			to={ getSiteSettingsRepositoriesURL( site.slug ) }
			title={ __( 'GitHub repositories' ) }
			density={ density }
			decoration={ <Icon icon={ <GithubIcon width={ 24 } height={ 24 } /> } /> }
		/>
	);
}
