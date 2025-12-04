import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canViewSiteVisibilitySettings } from '../features';
import type { Site, SiteSettings } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SiteVisibilitySettingsSummary( {
	site,
	density,
	settings,
}: {
	site: Site;
	settings?: SiteSettings;
	density?: Density;
} ) {
	if ( ! canViewSiteVisibilitySettings( site ) ) {
		return null;
	}

	let badges = [];
	if ( settings?.wpcom_public_coming_soon === 1 ) {
		badges = [ { text: __( 'Coming soon' ), intent: 'warning' as const } ];
	} else if ( settings?.blog_public === -1 ) {
		badges = [ { text: __( 'Private' ) } ];
	} else {
		badges = [ { text: __( 'Public' ), intent: 'success' as const } ];
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/site-visibility` }
			title={ __( 'Site visibility' ) }
			density={ density }
			decoration={ <Icon icon={ seen } /> }
			badges={ badges }
		/>
	);
}
