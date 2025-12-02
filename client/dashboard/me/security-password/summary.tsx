import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lockOutline } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function SecurityAccountRecoverySummary() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const { is_passwordless_user } = userSettings;

	const badges: SummaryButtonBadgeProps[] = [];

	if ( is_passwordless_user ) {
		badges.push( {
			text: __( 'Password not set' ),
			intent: 'warning',
		} );
	}

	return (
		<RouterLinkSummaryButton
			to="/me/security/password"
			title={ __( 'Password' ) }
			description={ __( 'Strengthen your account by ensuring your password is strong.' ) }
			decoration={ <Icon icon={ lockOutline } /> }
			badges={ badges }
		/>
	);
}
