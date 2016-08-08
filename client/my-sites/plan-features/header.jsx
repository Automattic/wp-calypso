/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import Ribbon from 'components/ribbon';
import PlanFeaturesPrice from './price';
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	getPlanClass
} from 'lib/plans/constants';
import PlanIcon from 'components/plans/plan-icon';

class PlanFeaturesHeader extends Component {

	render() {
		const {
			billingTimeFrame,
			current,
			discountPrice,
			planType,
			popular,
			title,
			isPlaceholder,
			translate
		} = this.props;
		const isDiscounted = !! discountPrice;
		const timeframeClasses = classNames( 'plan-features__header-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder
		} );
		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<header className={ headerClasses } onClick={ this.props.onClick } >
				{
					popular && <Ribbon>{ translate( 'Popular' ) }</Ribbon>
				}
				<div className="plan-features__header-figure" >
					<PlanIcon plan={ planType } />
					{ current && <Gridicon icon="checkmark-circle" className="plan-features__header-checkmark" /> }
				</div>
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">{ title }</h4>
					{ this.getPlanFeaturesPrices() }
					<p className={ timeframeClasses } >
						{ ! isPlaceholder ? billingTimeFrame : '' }
					</p>
				</div>
			</header>
		);
	}

	getPlanFeaturesPrices() {
		const {
			currencyCode,
			discountPrice,
			rawPrice,
			isPlaceholder
		} = this.props;

		if ( isPlaceholder ) {
			return (
				<div className="plan-features__price is-placeholder"></div>
			);
		}

		if ( discountPrice ) {
			return (
				<span className="plan-features__header-price-group">
					<PlanFeaturesPrice currencyCode={ currencyCode } rawPrice={ rawPrice } original />
					<PlanFeaturesPrice currencyCode={ currencyCode } rawPrice={ discountPrice } discounted />
				</span>
			);
		}

		return (
			<PlanFeaturesPrice currencyCode={ currencyCode } rawPrice={ rawPrice } />
		);
	}
}

PlanFeaturesHeader.propTypes = {
	billingTimeFrame: PropTypes.string.isRequired,
	current: PropTypes.bool,
	onClick: PropTypes.func,
	planType: React.PropTypes.oneOf( [
		PLAN_FREE,
		PLAN_PREMIUM,
		PLAN_BUSINESS,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_PERSONAL
	] ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	discountPrice: PropTypes.number,
	currencyCode: PropTypes.string,
	title: PropTypes.string.isRequired,
	isPlaceholder: PropTypes.bool,
	translate: PropTypes.func
};

PlanFeaturesHeader.defaultProps = {
	current: false,
	onClick: noop,
	popular: false,
	isPlaceholder: false
};

export default localize( PlanFeaturesHeader );
