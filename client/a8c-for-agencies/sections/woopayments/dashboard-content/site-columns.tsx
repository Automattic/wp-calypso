import { BadgeType, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { memo } from 'react';
import { A4A_WOOPAYMENTS_SITE_SETUP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const TransactionsColumn = memo( ( { transactions }: { transactions: number | null } ) => {
	return transactions ?? <Gridicon icon="minus" />;
} );

export const CommissionsPaidColumn = memo( ( { payout }: { payout: number | null } ) => {
	return payout ? formatCurrency( payout, 'USD', { stripZeros: true } ) : <Gridicon icon="minus" />;
} );

export const WooPaymentsStatusColumn = ( { state, siteId }: { state: string; siteId: number } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	if ( ! state ) {
		return (
			<Button
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_a4a_woopayments_setup_in_wp_admin' ) );
				} }
				variant="tertiary"
				href={ `${ A4A_WOOPAYMENTS_SITE_SETUP_LINK }/?site_id=${ siteId }` }
			>
				{ translate( 'Continue setup' ) }
			</Button>
		);
	}

	const getStatusProps = () => {
		switch ( state ) {
			case 'active':
				return {
					statusText: translate( 'Active' ),
					statusType: 'success',
				};
			case 'disconnected':
				return {
					statusText: translate( 'Disconnected' ),
					statusType: 'error',
				};
			default:
				return null;
		}
	};

	const statusProps = getStatusProps();

	if ( ! statusProps ) {
		return null;
	}

	return (
		<StatusBadge
			statusProps={ {
				children: statusProps.statusText,
				type: statusProps.statusType as BadgeType,
			} }
		/>
	);
};
