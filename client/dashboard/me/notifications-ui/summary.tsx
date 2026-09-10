import { isAutomatticianQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { brush } from '@wordpress/icons';
import { notificationsUiRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export const NotificationsUserInterfaceSummary = ( { density }: { density?: Density } ) => {
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	if ( ! config.isEnabled( 'notifications/view-settings' ) || ! isAutomattician ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			density={ density }
			to={ notificationsUiRoute.fullPath }
			title={ __( 'User interface' ) }
			description={ __( 'Choose how your notifications are presented.' ) }
			decoration={ <Icon icon={ brush } /> }
		/>
	);
};
