import {
	formatNumber,
	formatNumberCompact,
	formatCurrency,
	getCurrencyObject,
} from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { Component } from 'react';

// Simple function component with hooks
export function StatsCard( { value, currency } ) {
	const translate = useTranslate();

	const formattedNumber = formatNumber( value );
	const compactNumber = formatNumberCompact( value );
	const price = formatCurrency( value, currency );
	const currencyInfo = getCurrencyObject( currency );

	return (
		<div>
			<div>Regular: { formattedNumber }</div>
			<div>Compact: { compactNumber }</div>
			<div>Price: { price }</div>
			<div>Currency Symbol: { currencyInfo.symbol }</div>
		</div>
	);
}

// Class component with direct usage
export class PurchaseItem extends Component {
	render() {
		const { value, currency } = this.props;

		return (
			<div>
				<div>Amount: { formatNumber( value ) }</div>
				<div>Price: { formatCurrency( value, currency ) }</div>
			</div>
		);
	}
}

// Utility function
export function formatStats( stats ) {
	return {
		views: formatNumber( stats.views ),
		revenue: formatCurrency( stats.revenue, 'USD' ),
		followers: formatNumberCompact( stats.followers ),
	};
}
