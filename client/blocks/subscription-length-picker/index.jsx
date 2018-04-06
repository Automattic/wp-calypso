/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import formatCurrency from 'lib/format-currency';
import { computeProductsWithPrices } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { PLANS_LIST } from 'lib/plans/constants';
import QueryPlans from 'components/data/query-plans';
import QueryProductsList from 'components/data/query-products-list';
import SubscriptionLengthOption from './option';

export class SubscriptionLengthPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.string,
		plans: PropTypes.arrayOf( PropTypes.oneOf( Object.keys( PLANS_LIST ) ) ),

		currencyCode: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
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

	render() {
		const { productsWithPrices, translate } = this.props;
		return (
			<div className="subscription-length-picker">
				{ ! productsWithPrices && (
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
					{ productsWithPrices.map( p => this.renderProduct( p ) ) }
				</div>
			</div>
		);
	}

	renderProduct = product => {
		const { plan, planSlug } = product;

		return (
			<div className="subscription-length-picker__option-container" key={ planSlug }>
				<SubscriptionLengthOption
					term={ plan.term }
					checked={ planSlug === this.state.checked }
					price={ myFormatCurrency( product.priceFull, this.props.currencyCode ) }
					pricePerMonth={ myFormatCurrency( product.priceMonthly, this.props.currencyCode ) }
					savePercent={ Math.round(
						100 * ( 1 - product.priceMonthly / this.getHighestMonthlyPrice() )
					) }
					value={ planSlug }
					onCheck={ this.handleCheck }
				/>
			</div>
		);
	};

	getHighestMonthlyPrice() {
		return Math.max( ...this.props.productsWithPrices.map( p => Number( p.priceMonthly ) ) );
	}

	handleCheck = ( { value } ) => {
		this.setState( {
			checked: value,
		} );
		this.props.onChange( { value } );
	};
}

const EPSILON = 0.009;

function myFormatCurrency( price, code ) {
	const hasCents = Math.abs( price % 1 ) > EPSILON;
	return formatCurrency( price, code, {
		precision: hasCents ? 2 : 0,
	} );
}

export const mapStateToProps = ( state, { plans } ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		productsWithPrices: computeProductsWithPrices( state, selectedSiteId, plans ),
	};
};

export default connect( mapStateToProps )( localize( SubscriptionLengthPicker ) );
