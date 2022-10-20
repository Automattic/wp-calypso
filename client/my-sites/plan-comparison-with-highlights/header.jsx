import { getPlans, getPlanClass } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PlanPill from 'calypso/components/plans/plan-pill';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';

const PLANS_LIST = getPlans();

export class PlanComparisonWithHighlightsHeader extends Component {
	render() {
		return this.renderPlansHeaderNoTabs();
	}

	getPlanPillText() {
		const { flow, translate } = this.props;

		switch ( flow ) {
			case NEWSLETTER_FLOW:
				return translate( 'Best for Newsletters' );
			case LINK_IN_BIO_FLOW:
				return translate( 'Best for Link in Bio' );
			default:
				return translate( 'Popular' );
		}
	}

	renderPlansHeaderNoTabs() {
		const { planType, popular, selectedPlan, title, audience } = this.props;

		const headerClasses = classNames(
			'plan-comparison-with-highlights__header',
			getPlanClass( planType )
		);

		return (
			<span>
				<div>
					{ popular && ! selectedPlan && (
						<PlanPill isInSignup={ true }>{ this.getPlanPillText() }</PlanPill>
					) }
				</div>
				<header className={ headerClasses }>
					<h4 className="plan-comparison-with-highlights__header-title">{ title }</h4>
				</header>
				<div className="plan-comparison-with-highlights__pricing">
					{ this.renderPriceGroup() }
					{ this.getBillingTimeframe() }
					{ this.getAnnualDiscount() }
				</div>
				<div className="plan-comparison-with-highlights__audience">{ audience }:</div>
			</span>
		);
	}

	getPerMonthDescription() {
		const {
			rawPrice,
			rawPriceAnnual,
			currencyCode,
			translate,
			annualPricePerMonth,
			isMonthlyPlan,
		} = this.props;

		if ( isMonthlyPlan && annualPricePerMonth < rawPrice ) {
			const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
			return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
		}

		if ( ! isMonthlyPlan ) {
			const annualPriceObj = getCurrencyObject( rawPriceAnnual, currencyCode );
			const annualPriceText = `${ annualPriceObj.symbol }${ annualPriceObj.integer }`;

			return translate( 'billed as %(price)s annually', {
				args: { price: annualPriceText },
			} );
		}

		return null;
	}

	getAnnualDiscount() {
		const { isMonthlyPlan, rawPriceForMonthlyPlan, annualPricePerMonth, translate } = this.props;

		if ( ! isMonthlyPlan ) {
			const isLoading = typeof rawPriceForMonthlyPlan !== 'number';

			const discountRate = Math.round(
				( 100 * ( rawPriceForMonthlyPlan - annualPricePerMonth ) ) / rawPriceForMonthlyPlan
			);
			const annualDiscountText = translate( `You're saving %(discountRate)s%% by paying annually`, {
				args: { discountRate },
			} );

			return (
				<div
					className={ classNames( {
						'plan-comparison-with-highlights__header-annual-discount': true,
						'plan-comparison-with-highlights__header-annual-discount-is-loading': isLoading,
					} ) }
				>
					<span>{ annualDiscountText }</span>
				</div>
			);
		}
	}

	getBillingTimeframe() {
		const { billingTimeFrame } = this.props;
		const perMonthDescription = this.getPerMonthDescription() || billingTimeFrame;

		return (
			<div className="plan-comparison-with-highlights__header-billing-info">
				<span>{ perMonthDescription }</span>
			</div>
		);
	}

	renderPriceGroup() {
		const { currencyCode, rawPrice, discountPrice } = this.props;

		if ( discountPrice ) {
			return (
				<span className="plan-comparison-with-highlights__header-price-group">
					<div className="plan-comparison-with-highlights__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ rawPrice }
							displayPerMonthNotation={ true }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ true }
							discounted
						/>
					</div>
				</span>
			);
		}

		return (
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ rawPrice }
				displayPerMonthNotation={ true }
			/>
		);
	}
}

PlanComparisonWithHighlightsHeader.propTypes = {
	billingTimeFrame: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	currencyCode: PropTypes.string,
	discountPrice: PropTypes.number,
	planType: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// For Monthly Pricing test
	annualPricePerMonth: PropTypes.number,
	flow: PropTypes.string,
};

PlanComparisonWithHighlightsHeader.defaultProps = {
	popular: false,
};

export default connect( ( state ) => {
	return {
		flow: getCurrentFlowName( state ),
	};
} )( localize( PlanComparisonWithHighlightsHeader ) );
