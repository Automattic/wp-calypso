import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { notFound } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function StaticFile404SettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/static-file-404` }
			title={ __( 'Handling requests for nonexistent assets' ) }
			density={ density }
			decoration={ <Icon icon={ notFound } /> }
		/>
	);
}
