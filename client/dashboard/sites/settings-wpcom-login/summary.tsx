import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import { siteJetpackModulesQuery } from '../../app/queries/site-jetpack-module';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { JetpackModules } from '../../data/constants';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WpcomLoginSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: jetpackModules } = useSuspenseQuery( siteJetpackModulesQuery( site.ID ) );

	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		return null;
	}

	const ssoEnabled = jetpackModules?.includes( JetpackModules.SSO ) ?? false;

	const badges = ssoEnabled
		? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
		: [ { text: __( 'Disabled' ) } ];

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/wpcom-login` }
			title={ __( 'WordPress.com log in' ) }
			density={ density }
			decoration={ <Icon icon={ key } /> }
			badges={ badges }
		/>
	);
}
