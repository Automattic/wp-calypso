import {
	numberFormat,
	numberFormatCompact,
	formatCurrency,
	getCurrencyObject,
	translate,
	useTranslate,
} from 'i18n-calypso';
import { something } from 'other-module';
import { Component } from 'react';

// Direct function calls
const formattedNumber = numberFormat( 1234.56 );
const compactNumber = numberFormatCompact( 1234567 );
const money = formatCurrency( 99.99, 'USD' );
const currencyObj = getCurrencyObject( 99.99, 'USD' );

// Member expression calls (from props)
class MyComponent extends React.Component {
	render() {
		const { numberFormat: propsNumberFormat } = this.props;
		return (
			<div>
				{ propsNumberFormat( 1234.56 ) }
				{ this.props.numberFormatCompact( 1234567 ) }
				{ this.props.formatCurrency( 99.99, 'USD' ) }
			</div>
		);
	}
}

// Simple function component with hooks
export function StatsCard( { value, currency } ) {
	const translate = useTranslate();

	const formattedNumber = numberFormat( value );
	const compactNumber = numberFormatCompact( value );
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
				<div>Amount: { numberFormat( value ) }</div>
				<div>Price: { formatCurrency( value, currency ) }</div>
			</div>
		);
	}
}

// Utility function
export function formatStats( stats ) {
	return {
		views: numberFormat( stats.views ),
		revenue: formatCurrency( stats.revenue, 'USD' ),
		followers: numberFormatCompact( stats.followers ),
	};
}
