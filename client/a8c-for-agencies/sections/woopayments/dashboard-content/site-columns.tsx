import { BadgeType, Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate, formatCurrency } from 'i18n-calypso';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { urlToSlug } from 'calypso/lib/url/http-utils';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const TransactionsColumn = ( { transactions }: { transactions: number } ) => {
	return transactions ?? <Gridicon icon="minus" />;
};

export const CommissionsPaidColumn = ( { payout }: { payout: number } ) => {
	return payout ? formatCurrency( payout, 'USD', { stripZeros: true } ) : <Gridicon icon="minus" />;
};

export const WooPaymentsStatusColumn = ( {
	state,
	siteUrl,
}: {
	state: string;
	siteUrl: string;
} ) => {
	const translate = useTranslate();

	if ( ! state ) {
		return (
			<Button
				variant="secondary"
				href={ `${ siteUrl }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term` }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Setup in WP-Admin ↗' ) }
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
			default:
				return {
					statusText: translate( 'Disconnected' ),
					statusType: 'warning',
				};
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
