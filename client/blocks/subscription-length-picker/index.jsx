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
import { getPlansBySiteId, isRequestingSitePlans } from 'state/sites/plans/selectors';
import { localize } from 'i18n-calypso';
import formatCurrency from 'lib/format-currency';
import { getProductsList, isProductsListFetching } from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';
import { requestPlans } from 'state/plans/actions';
import { getPlanRawPrice, isRequestingPlans } from '../../state/plans/selectors';
import { getCurrentUserCurrencyCode } from '../../state/current-user/selectors';
import { getPlanDiscountedRawPrice } from '../../state/sites/plans/selectors';
import { getSelectedSiteId } from '../../state/ui/selectors';
import { abtest } from 'lib/abtest';
import { getPlan, applyTestFiltersToPlansList } from 'lib/plans';
import { TERM_MONTHLY } from 'lib/plans/constants';
import SubscriptionLengthOption from './option';

export class SubscriptionLengthPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.string,
		currencyCode: PropTypes.string.isRequired,
		productsWithPrices: PropTypes.array.isRequired,
		onChange: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onChange: () => null,
	};

	constructor( props ) {
		super( props );
		this.state = {
			checked: props.initialValue,
		};
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

	renderProduct = p => {
		const { plan, planSlug } = p;

		return (
			<div className="subscription-length-picker__option-container" key={ planSlug }>
				<SubscriptionLengthOption
					term={ plan.term }
					checked={ planSlug === this.state.checked }
					price={ myFormatCurrency( p.priceFull, this.props.currencyCode ) }
					pricePerMonth={ myFormatCurrency( p.priceMonthly, this.props.currencyCode ) }
					savePercent={ Math.round( 100 * ( 1 - p.priceMonthly / this.getHighestMonthlyPrice() ) ) }
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

class SubscriptionLengthPickerContainer extends React.Component {
	static defaultProps = {
		...SubscriptionLengthPicker.defaultProps,

		fetchingPlans: PropTypes.bool.isRequired,
		fetchingProducts: PropTypes.bool.isRequired,
		requestProductsList: PropTypes.func.isRequired,
		requestPlans: PropTypes.func.isRequired,
	};

	componentWillMount() {
		if ( this.props.productsWithPrices.length === 0 ) {
			if ( ! this.props.fetchingProducts ) {
				this.props.requestProductsList();
			}
			if ( ! this.props.fetchingPlans ) {
				this.props.requestPlans();
			}
		}
	}

	render() {
		return <SubscriptionLengthPicker { ...this.props } />;
	}
}

const EPSILON = 0.009;

function myFormatCurrency( price, code ) {
	const hasCents = Math.abs( price % 1 ) > EPSILON;
	return formatCurrency( price, code, {
		precision: hasCents ? 2 : 0,
	} );
}

const computeProductsWithPrices = ( state, plans ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const products = getProductsList( state );

	const computePrice = ( planSlug, planProductId, isMonthlyPreference ) => {
		// @TODO: In another PR getPlanDiscountedRawPrice and getPlanRawPrice should be
		//			  updated to not divide jetpack monthly plans price by 12 if monthly price
		//        is requested. This may have system-wide consequences and requires delicate
		//        attention out of scope of this code.
		const plan = getPlan( planSlug );
		const isMonthly = isMonthlyPreference && plan.term !== TERM_MONTHLY;
		return (
			getPlanDiscountedRawPrice( state, selectedSiteId, planSlug, { isMonthly } ) ||
			getPlanRawPrice( state, planProductId, isMonthly )
		);
	};

	return plans
		.map( planSlug => {
			const plan = getPlan( planSlug );
			const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
			return {
				planSlug,
				plan: planConstantObj,
				product: products[ planSlug ],
			};
		} )
		.filter( p => p.plan && p.product && p.product.available )
		.map( object => {
			const productId = object.plan.getProductId();
			return {
				...object,

				priceFull: computePrice( object.planSlug, productId, false ),
				priceMonthly: computePrice( object.planSlug, productId, true ),
			};
		} )
		.filter( p => p.priceFull )
		.sort( ( a, b ) => b.priceMonthly - a.priceMonthly );
};

export default connect(
	( state, { plans } ) => {
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
	},
	{
		requestPlans,
		requestProductsList,
	}
)( localize( SubscriptionLengthPickerContainer ) );
