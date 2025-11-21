import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function AISiteAssistantSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/ai-assistant` }
			title={ __( 'WordPress AI Assistant' ) }
			density={ density }
			decoration={ <BigSkyLogo.CentralLogo heartless size={ 24 } fill="#757575" /> }
		/>
	);
}
