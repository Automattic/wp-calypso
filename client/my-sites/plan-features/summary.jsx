/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
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
		planTitle: PropTypes.string.isRequired,
		rawPrice: PropTypes.number,
		relatedMonthlyPlan: PropTypes.object,
		site: PropTypes.object.isRequired,
	};

	renderWPCOMSummary() {
		const { currencyCode, discountPrice, planTitle, rawPrice } = this.props;
		const discount = rawPrice - discountPrice;

		if ( ! discountPrice ) {
			return null;
		}

		// Note: Don't make this translatable because it's only visible to English-language users
		return (
			<Fragment>
				<strong className="plan-features__summary-title">Credit summary</strong>
				<div className="plan-features__summary-price-row">
					<span className="plan-features__summary-item">{ planTitle } plan</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( rawPrice, currencyCode ) }
					</span>
				</div>
				<div className="plan-features__summary-price-row plan-features__summary-discount">
					<span className="plan-features__summary-item">WordPress.com credits</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( discount, currencyCode ) }
					</span>
					<div className="plan-features__summary-price-desc">
						( { formatCurrency( discount * 12, currencyCode ) } / 12 months )
					</div>
				</div>
				<div className="plan-features__summary-price-row plan-features__summary-total">
					<span className="plan-features__summary-item">Total</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( discountPrice, currencyCode ) }
					</span>
				</div>
			</Fragment>
		);
	}

	renderJetpackSummary() {
		const { currencyCode, planTitle, rawPrice, relatedMonthlyPlan } = this.props;

		if ( ! relatedMonthlyPlan ) {
			return null;
		}

		const discount = relatedMonthlyPlan.raw_price * 12 - rawPrice;

		// Note: Don't make this translatable because it's only visible to English-language users
		return (
			<Fragment>
				<strong className="plan-features__summary-title">Discount summary</strong>
				<div className="plan-features__summary-price-row">
					<span className="plan-features__summary-item">{ planTitle } plan</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( relatedMonthlyPlan.raw_price * 12, currencyCode ) }
					</span>
				</div>
				<div className="plan-features__summary-price-row plan-features__summary-discount">
					<span className="plan-features__summary-item">Jetpack discount</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( discount, currencyCode ) }
					</span>
				</div>
				<div className="plan-features__summary-price-row plan-features__summary-total">
					<span className="plan-features__summary-item">Total</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( rawPrice, currencyCode ) }
					</span>
				</div>
			</Fragment>
		);
	}

	render() {
		const { available, current, site } = this.props;

		if ( current || ! available ) {
			return null;
		}

		const summary = site.jetpack ? this.renderJetpackSummary() : this.renderWPCOMSummary();
		if ( ! summary ) {
			return null;
		}

		// Note: Don't make this translatable because it's only visible to English-language users
		return (
			<div className="plan-features__summary">
				{ summary }
				{ ! current && (
					<div className="plan-features__summary-policy">30-day money-back guarantee included</div>
				) }
			</div>
		);
	}
}

export default localize( PlanFeaturesSummary );
