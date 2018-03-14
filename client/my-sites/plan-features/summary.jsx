/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 **/
import formatCurrency from 'lib/format-currency';

class PlanFeaturesSummary extends Component {
	static propTypes = {
		available: PropTypes.bool.isRequired,
		currencyCode: PropTypes.string,
		current: PropTypes.bool,
		currentPlanTitle: PropTypes.string,
		planTitle: PropTypes.string.isRequired,
		rawPrice: PropTypes.number,
		relatedMonthlyPlan: PropTypes.object,
		site: PropTypes.object.isRequired,
	};

	// Note: Don't make this translatable because it's only visible to English-language users
	getTitle() {
		const { current, site } = this.props;
		const isJetpackSite = !! site.jetpack;

		if ( current ) {
			return 'Plan summary';
		}

		if ( isJetpackSite ) {
			return 'Discount summary';
		}

		return 'Credit summary';
	}

	render() {
		const {
			available,
			currencyCode,
			current,
			currentPlanTitle,
			discountPrice,
			planTitle,
			rawPrice,
			relatedMonthlyPlan,
			site,
		} = this.props;
		const isJetpackSite = !! site.jetpack;

		let monthlyPrice, yearlyPrice, discountYearlyPrice;

		if ( ! current && ! available ) {
			return null;
		}

		if ( isJetpackSite && current ) {
			return null;
		}

		if ( discountPrice ) {
			if ( isJetpackSite ) {
				yearlyPrice = rawPrice;
				discountYearlyPrice = discountPrice;
			} else {
				monthlyPrice = rawPrice;
				yearlyPrice = monthlyPrice * 12;
				discountYearlyPrice = discountPrice * 12;
			}
		} else if ( relatedMonthlyPlan ) {
			yearlyPrice = relatedMonthlyPlan.raw_price * 12;
			discountYearlyPrice = rawPrice;
		}

		if ( ! yearlyPrice || ! discountYearlyPrice ) {
			return null;
		}

		// Note: Don't make this translatable because it's only visible to English-language users
		return (
			<div className="plan-features__summary">
				<strong className="plan-features__summary-title">{ this.getTitle() }</strong>
				<div className="plan-features__summary-price-row">
					<span className="plan-features__summary-item">{ planTitle } plan</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( yearlyPrice, currencyCode ) }
					</span>
					{ monthlyPrice && (
						<div className="plan-features__summary-price-desc">
							({ formatCurrency( monthlyPrice, currencyCode ) } x 12 months)
						</div>
					) }
				</div>
				{ !! discountYearlyPrice && (
					<div className="plan-features__summary-price-row plan-features__summary-discount">
						<span className="plan-features__summary-item">
							{ isJetpackSite ? 'Jetpack discount' : `${ currentPlanTitle } plan credits` }
						</span>
						<span className="plan-features__summary-price">
							{ formatCurrency( discountYearlyPrice - yearlyPrice, currencyCode ) }
						</span>
					</div>
				) }
				<div className="plan-features__summary-price-row plan-features__summary-total">
					<span className="plan-features__summary-item">Total</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( discountYearlyPrice || yearlyPrice, currencyCode ) }
					</span>
				</div>
				{ ! current && (
					<div className="plan-features__summary-policy">30-day money-back guarantee included</div>
				) }
			</div>
		);
	}
}

export default localize( PlanFeaturesSummary );
