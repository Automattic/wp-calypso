import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { blockTable } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canOpenPhpMyAdmin } from './index';
import type { Site } from '../../data/types';

export default function DatabaseSettingsSummary( { site }: { site: Site } ) {
	if ( ! canOpenPhpMyAdmin( site ) ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/database` }
			title={ __( 'Database' ) }
			density="medium"
			decoration={ <Icon icon={ blockTable } /> }
		/>
	);
}
