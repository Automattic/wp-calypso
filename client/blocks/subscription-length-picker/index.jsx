/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isNumber } from 'lodash';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import formatCurrency from 'lib/format-currency';
import { CURRENCIES } from 'lib/format-currency/currencies';
import { computeProductsWithPrices } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { PLANS_LIST } from 'lib/plans/constants';
import QueryPlans from 'components/data/query-plans';
import QueryProductsList from 'components/data/query-products-list';
import SubscriptionLengthOption from './option';
import getTaxRate from 'state/selectors/get-tax-rate';
import getShouldShowTax from 'state/selectors/get-should-show-tax';

export class SubscriptionLengthPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.string,
		plans: PropTypes.arrayOf( PropTypes.oneOf( Object.keys( PLANS_LIST ) ) ),

		currencyCode: PropTypes.oneOf( Object.keys( CURRENCIES ) ).isRequired,
		onChange: PropTypes.func,
		translate: PropTypes.func.isRequired,

		// Comes from connect():
		productsWithPrices: PropTypes.array.isRequired,
	};

	static defaultProps = {
		onChange: () => null,
	};

	state = {
		checked: this.props.initialValue,
	};

	formatTax( taxRate, price, currencyCode ) {
		const { translate } = this.props;

		// taxRate unknown
		if ( ! isNumber( taxRate ) ) {
			// translators: This string is displayed immediately next to a localized price with a currency symbol, and is indicating that there may be an additional charge on top of the displayed price.
			return translate( '+tax' );
		}

		// a zero tax rate - don't display anything
		if ( ! taxRate ) {
			return '';
		}

		// translators: taxAmount is a price with localised formatting but not currency symbol, like 1.234,56 or 1,234.56. The string is displayed immediately next to a price with a currency symbol, and is showing the amount of local sales tax added to that "sticker price".
		return translate( '+%(taxAmount)s tax', {
			args: {
				taxAmount: myFormatCurrency( price * taxRate, currencyCode, { symbol: '' } ),
			},
		} );
	}

	render() {
		const { productsWithPrices, translate, taxRate, shouldShowTax } = this.props;
		const hasDiscount = productsWithPrices.some(
			( { priceFullBeforeDiscount, priceFull } ) => priceFull !== priceFullBeforeDiscount
		);

		return (
			<div className="subscription-length-picker">
				{ ! productsWithPrices.length && (
					<React.Fragment>
						<QueryPlans />
						<QueryProductsList />
					</React.Fragment>
				) }

				<div className="subscription-length-picker__header">
					{ translate( 'Choose the length of your subscription', {
						comment:
							'We offer a way to change billing term from default bill every 1 year to something ' +
							'else like bill once every 2 years - this is related header.',
					} ) }
				</div>

				<div className="subscription-length-picker__options">
					{ productsWithPrices.map(
						( { plan, planSlug, priceFullBeforeDiscount, priceFull, priceMonthly } ) => (
							<div className="subscription-length-picker__option-container" key={ planSlug }>
								<SubscriptionLengthOption
									type={ hasDiscount ? 'upgrade' : 'new-sale' }
									term={ plan.term }
									checked={ planSlug === this.state.checked }
									price={ myFormatCurrency( priceFull, this.props.currencyCode ) }
									priceBeforeDiscount={ myFormatCurrency(
										priceFullBeforeDiscount,
										this.props.currencyCode
									) }
									pricePerMonth={ myFormatCurrency( priceMonthly, this.props.currencyCode ) }
									savePercent={ Math.round(
										100 * ( 1 - priceMonthly / this.getHighestMonthlyPrice() )
									) }
									value={ planSlug }
									onCheck={ this.handleCheck }
									shouldShowTax={ shouldShowTax }
									taxRate={ taxRate }
									taxDisplay={
										shouldShowTax && this.formatTax( taxRate, priceFull, this.props.currencyCode )
									}
								/>
							</div>
						)
					) }
				</div>
			</div>
		);
	}

	getHighestMonthlyPrice() {
		return Math.max(
			...this.props.productsWithPrices.map( ( { priceMonthly } ) => Number( priceMonthly ) )
		);
	}

	handleCheck = ( { value } ) => {
		this.setState( {
			checked: value,
		} );
		this.props.onChange( { value } );
	};
}

export function myFormatCurrency( price, code, options = {} ) {
	const precision = CURRENCIES[ code ].precision;
	const EPSILON = Math.pow( 10, -precision ) - 0.000000001;

	const hasCents = Math.abs( price % 1 ) >= EPSILON;
	return formatCurrency( price, code, hasCents ? options : { ...options, precision: 0 } );
}

export const mapStateToProps = ( state, { plans } ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		productsWithPrices: computeProductsWithPrices( state, selectedSiteId, plans ),
		shouldShowTax: getShouldShowTax( state ),
		taxRate: getTaxRate( state ),
	};
};

export default connect( mapStateToProps )( localize( SubscriptionLengthPicker ) );
