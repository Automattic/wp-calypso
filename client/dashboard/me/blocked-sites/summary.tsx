import { blockedSitesCountQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { notAllowed } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function BlockedSitesSummary() {
	const { data: blockedSites } = useSuspenseQuery( blockedSitesCountQuery() );
	const count = blockedSites?.length ?? 0;

	const badges: SummaryButtonBadgeProps[] = [
		{
			text:
				count === 0
					? __( 'None' )
					: sprintf(
							/* translators: %d is the number of blocked sites */
							_n( '%d site', '%d sites', count ),
							count
					  ),
			intent: 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/blocked-sites"
			title={ __( 'Blocked sites' ) }
			description={ __( 'Sites that won\u2019t appear in your Reader or recommendations.' ) }
			decoration={ <Icon icon={ notAllowed } /> }
			badges={ badges }
		/>
	);
}
