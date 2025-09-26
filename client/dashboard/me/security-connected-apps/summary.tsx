import { connectedApplicationsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function SecurityConnectedAppsSummary() {
	const { data: connectedApplications } = useSuspenseQuery( connectedApplicationsQuery() );

	const connectedApplicationsCount = connectedApplications.length;

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: connectedApplicationsCount
				? sprintf(
						/* translators: %d is the number of connected applications */
						_n(
							'%d connected application',
							'%d connected applications',
							connectedApplicationsCount
						),
						connectedApplicationsCount
				  )
				: __( 'No connected applications' ),
			intent: connectedApplicationsCount ? 'info' : 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/security/connected-apps"
			title={ __( 'Connected applications' ) }
			description={ __( 'Manage applications connected to your WordPress.com account.' ) }
			decoration={ <Icon icon={ connection } /> }
			badges={ badges }
		/>
	);
}
