import { getPlans, getPlanClass } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PlanPill from 'calypso/components/plans/plan-pill';
import PlanPrice from 'calypso/my-sites/plan-price';

const PLANS_LIST = getPlans();

export class PlanFeaturesComparisonHeader extends Component {
	render() {
		return this.renderPlansHeaderNoTabs();
	}

	renderPlansHeaderNoTabs() {
		const { disabledClasses, planType, popular, selectedPlan, title, translate } = this.props;

		const headerClasses = classNames(
			'plan-features-comparison__header',
			getPlanClass( planType ),
			disabledClasses
		);

		return (
			<span>
				<div>
					{ popular && ! selectedPlan && (
						<PlanPill isInSignup={ true }>{ translate( 'Popular' ) }</PlanPill>
					) }
				</div>
				<header className={ headerClasses }>
					<h4 className={ classNames( 'plan-features-comparison__header-title', disabledClasses ) }>
						{ title }
					</h4>
				</header>
				<div className={ classNames( 'plan-features-comparison__pricing', disabledClasses ) }>
					{ this.renderPriceGroup() }
					{ this.getBillingTimeframe() }
				</div>
				{ this.getAnnualDiscount() }
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
			disabledClasses,
		} = this.props;

		if ( disabledClasses[ 'plan-monthly-disabled-experiment' ] ) {
			return null;
		}

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
		const {
			disabledClasses,
			isMonthlyPlan,
			rawPriceForMonthlyPlan,
			annualPricePerMonth,
			translate,
		} = this.props;

		if ( disabledClasses[ 'plan-monthly-disabled-experiment' ] ) {
			return (
				<div className="plan-features-comparison__not-available-with-monthly-disclaimer">
					This plan is only available with annual billing
				</div>
			);
		}

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
						'plan-features-comparison__header-annual-discount': ! disabledClasses[
							'plan-monthly-disabled-experiment'
						],
						'plan-features-comparison__header-annual-discount-is-loading': isLoading,
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
			<div className="plan-features-comparison__header-billing-info">
				<span>{ perMonthDescription }</span>
			</div>
		);
	}

	renderPriceGroup() {
		const { currencyCode, disabledClasses, rawPrice, discountPrice } = this.props;
		const displayNotation = ! disabledClasses[ 'plan-monthly-disabled-experiment' ];

		if ( discountPrice ) {
			return (
				<span className="plan-features-comparison__header-price-group">
					<div className={ classNames( 'plan-features-comparison__header-price-group-prices' ) }>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ rawPrice }
							displayPerMonthNotation={ displayNotation }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ displayNotation }
							discounted
						/>
					</div>
				</span>
			);
		}

		return (
			<div className={ classNames( disabledClasses ) }>
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ rawPrice }
					displayPerMonthNotation={ displayNotation }
				/>
			</div>
		);
	}
}

PlanFeaturesComparisonHeader.propTypes = {
	billingTimeFrame: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	currencyCode: PropTypes.string,
	discountPrice: PropTypes.number,
	planType: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,
	disabledClasses: PropTypes.object,

	// For Monthly Pricing test
	annualPricePerMonth: PropTypes.number,
};

PlanFeaturesComparisonHeader.defaultProps = {
	popular: false,
};

export default localize( PlanFeaturesComparisonHeader );
