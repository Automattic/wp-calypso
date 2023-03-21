import { getPlans, getPlanClass } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
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

	getPlanPillText() {
		const { flow, translate } = this.props;

		switch ( flow ) {
			case NEWSLETTER_FLOW:
				return translate( 'Best for Newsletters' );
			case LINK_IN_BIO_FLOW:
			case LINK_IN_BIO_TLD_FLOW:
				return translate( 'Best for Link in Bio' );
			default:
				return translate( 'Popular' );
		}
	}

	renderPlansHeaderNoTabs() {
		const { planType, popular, selectedPlan, title } = this.props;

		const headerClasses = classNames(
			'plan-features-comparison__header',
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
					<h4 className="plan-features-comparison__header-title">{ title }</h4>
				</header>
				<div className="plan-features-comparison__pricing">
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
			planType,
		} = this.props;

		if ( isMonthlyPlan && annualPricePerMonth < rawPrice ) {
			const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
			return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
		}

		if ( ! isMonthlyPlan ) {
			const annualPriceObj = getCurrencyObject( rawPriceAnnual, currencyCode );
			const annualPriceText = `${ annualPriceObj.symbol }${ annualPriceObj.integer }`;

			return [
				'personal-bundle-2y',
				'value_bundle-2y',
				'business-bundle-2y',
				'ecommerce-bundle-2y',
			].includes( planType )
				? translate( 'billed as %(price)s biannually', {
						args: { price: annualPriceText },
				  } )
				: translate( 'billed as %(price)s annually', {
						args: { price: annualPriceText },
				  } );
		}

		return null;
	}

	getAnnualDiscount() {
		const { isMonthlyPlan, rawPriceForMonthlyPlan, annualPricePerMonth, translate, planType } =
			this.props;

		if ( ! isMonthlyPlan ) {
			const isLoading = typeof rawPriceForMonthlyPlan !== 'number';

			const discountRate = Math.round(
				( 100 * ( rawPriceForMonthlyPlan - annualPricePerMonth ) ) / rawPriceForMonthlyPlan
			);

			const annualDiscountText = [
				'personal-bundle-2y',
				'value_bundle-2y',
				'business-bundle-2y',
				'ecommerce-bundle-2y',
			].includes( planType )
				? translate( `You're saving %(discountRate)s%% by paying biannually`, {
						args: { discountRate },
				  } )
				: translate( `You're saving %(discountRate)s%% by paying annually`, {
						args: { discountRate },
				  } );

			return (
				<div
					className={ classNames( {
						'plan-features-comparison__header-annual-discount': true,
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
		const { currencyCode, rawPrice, discountPrice } = this.props;

		if ( discountPrice ) {
			return (
				<span className="plan-features-comparison__header-price-group">
					<div className="plan-features-comparison__header-price-group-prices">
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

PlanFeaturesComparisonHeader.propTypes = {
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

PlanFeaturesComparisonHeader.defaultProps = {
	popular: false,
};

export default localize( PlanFeaturesComparisonHeader );
