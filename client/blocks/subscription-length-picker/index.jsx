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
import {
	computeProductsWithPrices,
	getProductsList,
	isProductsListFetching,
} from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';
import { requestPlans } from 'state/plans/actions';
import { isRequestingPlans } from 'state/plans/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlansBySiteId, isRequestingSitePlans } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { PLANS_LIST } from 'lib/plans/constants';
import SubscriptionLengthOption from './option';

export class SubscriptionLengthPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.string,
		plans: PropTypes.oneOf( Object.keys( PLANS_LIST ) ),

		currencyCode: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,

		// Comes from connect():
		productsWithPrices: PropTypes.array.isRequired,

		fetchingPlans: PropTypes.bool,
		fetchingProducts: PropTypes.bool,
		requestProductsList: PropTypes.func,
		requestPlans: PropTypes.func,
	};

	static defaultProps = {
		onChange: () => null,
	};

	state = {
		checked: this.props.initialValue,
	};

	componentWillMount() {
		if ( this.props.productsWithPrices.length === 0 ) {
			if ( ! this.props.fetchingProducts && this.props.requestProductsList ) {
				this.props.requestProductsList();
			}
			if ( ! this.props.fetchingPlans && this.props.requestPlans ) {
				this.props.requestPlans();
			}
		}
	}

	render() {
		const { productsWithPrices, translate } = this.props;
		return (
			<div className="subscription-length-picker">
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
	const fetchingProducts = ! getProductsList( state ) && isProductsListFetching( state );
	const fetchingPlans = ! plans && isRequestingPlans( state );
	const fetchingSitePlans =
		! getPlansBySiteId( selectedSiteId ) || isRequestingSitePlans( state, selectedSiteId );
	const fetchingDeps = fetchingProducts || fetchingPlans || fetchingSitePlans;

	return {
		fetchingPlans,
		fetchingProducts,
		currencyCode: getCurrentUserCurrencyCode( state ),
		productsWithPrices: fetchingDeps ? [] : computeProductsWithPrices( state, plans ),
	};
};

export default connect( mapStateToProps, {
	requestPlans,
	requestProductsList,
} )( localize( SubscriptionLengthPicker ) );
