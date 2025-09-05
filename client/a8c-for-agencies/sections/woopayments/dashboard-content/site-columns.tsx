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
import type { WooPaymentsData } from '../types';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const CommissionsPaidColumn = memo( ( { payout }: { payout: number | null } ) => {
	return payout ? formatCurrency( payout, 'USD', { stripZeros: true } ) : <Gridicon icon="minus" />;
} );
CommissionsPaidColumn.displayName = 'CommissionsPaidColumn';

export const TimeframeCommissionsColumn = memo(
	( { estimatedPayout }: { estimatedPayout: number | null } ) => {
		return estimatedPayout ? (
			formatCurrency( estimatedPayout, 'USD', { stripZeros: true } )
		) : (
			<Gridicon icon="minus" />
		);
	}
);
TimeframeCommissionsColumn.displayName = 'TimeframeCommissionsColumn';

export const WooPaymentsStatusColumn = ( {
	state,
	siteId,
	woopaymentsData,
}: {
	state: string;
	siteId: number;
	woopaymentsData?: WooPaymentsData;
} ) => {
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
		// Check if site exists in woopaymentsData
		const siteExistsInWooPaymentsData = woopaymentsData?.data?.total?.sites?.[ siteId ];

		// If site is active but not in woopaymentsData, it's not eligible
		if ( state === 'active' && ! siteExistsInWooPaymentsData ) {
			return {
				statusText: translate( 'Not eligible' ),
				statusType: 'error',
			};
		}

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
