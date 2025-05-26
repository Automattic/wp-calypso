import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { notFound } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';

export default function StaticFile404SettingsSummary( { site }: { site: Site } ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/static-file-404` }
			title={ __( 'Handling requests for nonexistent assets' ) }
			density="medium"
			decoration={ <Icon icon={ notFound } /> }
		/>
	);
}
