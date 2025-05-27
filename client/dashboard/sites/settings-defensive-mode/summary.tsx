import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteDefensiveModeQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateDefensiveMode } from '.';
import type { Site } from '../../data/types';

export default function DefensiveModeSettingsSummary( { site }: { site: Site } ) {
	const { data } = useQuery( {
		...siteDefensiveModeQuery( site.slug ),
		enabled: canUpdateDefensiveMode( site ),
	} );

	let badge;
	if ( data ) {
		badge = {
			text: data.enabled ? __( 'Enabled' ) : __( 'Disabled' ),
		};
	} else {
		badge = { text: __( 'Managed' ) };
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/defensive-mode` }
			title={ __( 'Defensive mode' ) }
			density="medium"
			decoration={ <Icon icon={ shield } /> }
			badges={ [ badge ] }
		/>
	);
}
