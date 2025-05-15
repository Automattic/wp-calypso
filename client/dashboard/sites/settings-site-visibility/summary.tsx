import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';

export default function SiteVisibilitySettingsSummary( { site }: { site: Site } ) {
	let badges = [];
	if ( site.launch_status === 'unlaunched' || site.is_coming_soon ) {
		badges = [ { text: __( 'Coming soon' ), intent: 'warning' as const } ];
	} else if ( site.is_private ) {
		badges = [ { text: __( 'Private' ) } ];
	} else {
		badges = [ { text: __( 'Public' ), intent: 'success' as const } ];
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/site-visibility` }
			title={ __( 'Site visibility' ) }
			density="medium"
			decoration={ <Icon icon={ seen } /> }
			badges={ badges }
		/>
	);
}
