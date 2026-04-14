import { blockedSitesInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { notAllowed } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesBlockedSites( { density }: { density?: Density } ) {
	const { data } = useInfiniteQuery( blockedSitesInfiniteQuery( 1 ) );
	const sites = ( data?.pages || [] ).flat();
	const count = sites.length;

	const badges =
		count === 0
			? [ { text: __( 'None' ) } ]
			: [
					{
						text: sprintf(
							/* translators: %d is the number of blocked sites */
							__( '%d blocked' ),
							count
						),
						intent: 'info' as const,
					},
			  ];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/blocked-sites"
			title={ __( 'Blocked sites' ) }
			description={ __( "Sites that won't appear in your Reader or recommendations." ) }
			decoration={ <Icon icon={ notAllowed } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
