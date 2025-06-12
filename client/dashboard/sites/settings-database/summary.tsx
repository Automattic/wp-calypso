import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { blockTable } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function DatabaseSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/database` }
			title={ __( 'Database' ) }
			density={ density }
			decoration={ <Icon icon={ blockTable } /> }
		/>
	);
}
