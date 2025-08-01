import { isEnabled } from '@automattic/calypso-config';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WpcomLoginSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		return null;
	}

	const badges = [
		{ text: __( 'Enabled' ), intent: 'success' as const },
		{ text: __( 'Disabled' ) },
	];

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
