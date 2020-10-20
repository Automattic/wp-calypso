/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import formatCurrency, { CURRENCIES } from '@automattic/format-currency';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import { computeProductsWithPrices } from 'calypso/state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PLANS_LIST } from 'calypso/lib/plans/plans-list';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProductsList from 'calypso/components/data/query-products-list';
import SubscriptionLengthOption from './option';

/**
 * Style dependencies
 */
import './style.scss';

export class SubscriptionLengthPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.string,
		plans: PropTypes.arrayOf( PropTypes.oneOf( Object.keys( PLANS_LIST ) ) ),
		cart: PropTypes.object,
		currencyCode: PropTypes.oneOf( Object.keys( CURRENCIES ) ).isRequired,
		onChange: PropTypes.func,
		translate: PropTypes.func.isRequired,

		// Comes from connect():
		productsWithPrices: PropTypes.array.isRequired,
	};

	static defaultProps = {
		onChange: () => null,
	};

	render() {
		const { productsWithPrices, translate, shouldShowTax } = this.props;
		const hasDiscount = productsWithPrices.some(
			( { priceFullBeforeDiscount, priceFinal } ) => priceFinal !== priceFullBeforeDiscount
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
						( {
							plan,
							planSlug,
							priceFull,
							priceFullBeforeDiscount,
							priceFinal,
							priceMonthly,
						} ) => {
							const price = priceFinal || priceFull;
							return (
								<div className="subscription-length-picker__option-container" key={ planSlug }>
									<SubscriptionLengthOption
										type={ hasDiscount ? 'upgrade' : 'new-sale' }
										term={ plan.term }
										checked={ planSlug === this.props.initialValue }
										price={ myFormatCurrency( price, this.props.currencyCode ) }
										priceBeforeDiscount={ myFormatCurrency(
											priceFullBeforeDiscount,
											this.props.currencyCode
										) }
										pricePerMonth={ myFormatCurrency( priceMonthly, this.props.currencyCode ) }
										savePercent={ Math.round(
											100 * ( 1 - priceMonthly / this.getHighestMonthlyPrice() )
										) }
										value={ planSlug }
										onCheck={ this.props.onChange }
										shouldShowTax={ shouldShowTax }
									/>
								</div>
							);
						}
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
}

export function myFormatCurrency( price, code, options = {} ) {
	const precision = CURRENCIES[ code ].precision;
	const EPSILON = Math.pow( 10, -precision ) - 0.000000001;

	const hasCents = Math.abs( price % 1 ) >= EPSILON;
	return formatCurrency( price, code, hasCents ? options : { ...options, precision: 0 } );
}

export const mapStateToProps = ( state, { plans, cart } ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		productsWithPrices: computeProductsWithPrices(
			state,
			selectedSiteId,
			plans,
			cart.credits || 0,
			cart.coupon_discounts || {}
		),
	};
};

export default connect( mapStateToProps )( localize( SubscriptionLengthPicker ) );
