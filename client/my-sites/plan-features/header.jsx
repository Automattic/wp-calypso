/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import InfoPopover from 'components/info-popover';
import { isMobile } from 'lib/viewport';
import Ribbon from 'components/ribbon';
import PlanPrice from 'my-sites/plan-price';
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	getPlanClass,
	isMonthly,
} from 'lib/plans/constants';
import PlanIcon from 'components/plans/plan-icon';
import { plansLink } from 'lib/plans';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

class PlanFeaturesHeader extends Component {

	render() {
		const { isInSignupTest } = this.props;
		let content = this.renderPlansHeader();

		if ( isInSignupTest ) {
			content = this.renderSignupHeader();
		}

		return content;
	}

	renderPlansHeader() {
		const {
			planType,
			popular,
			newPlan,
			title,
			translate
		} = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );
		return (
			<header className={ headerClasses } onClick={ this.props.onClick } >
				{
					popular && <Ribbon>{ translate( 'Popular' ) }</Ribbon>
				}
				{
					newPlan && <Ribbon>{ translate( 'New' ) }</Ribbon>
				}
				{
					this.isPlanCurrent() && <Ribbon>{ translate( 'Your Plan' ) }</Ribbon>
				}
				<div className="plan-features__header-figure" >
					<PlanIcon plan={ planType } />
				</div>
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">{ title }</h4>
					{ this.getPlanFeaturesPrices() }
					{ this.getBillingTimeframe() }
				</div>
			</header>
		);
	}

	renderSignupHeader() {
		const {
			planType,
			popular,
			newPlan,
			title,
			audience,
			translate
		} = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );
		return (
			<div className="plan-features__header-wrapper">
				<header className={ headerClasses } onClick={ this.props.onClick } >
					{
						popular && <Ribbon>{ translate( 'Popular' ) }</Ribbon>
					}
					{
						newPlan && <Ribbon>{ translate( 'New' ) }</Ribbon>
					}

					<div className="plan-features__header-text">
						<h4 className="plan-features__header-title">{ title }</h4>
						{ audience }
					</div>
				</header>
				<div className="plan-features__graphic">
					<PlanIcon plan={ planType } />
				</div>
				<div className="plan-features__pricing">
					{ this.getPlanFeaturesPrices() } { this.getBillingTimeframe() }
				</div>
			</div>
		);
	}

	getBillingTimeframe() {
		const {
			billingTimeFrame,
			discountPrice,
			isPlaceholder,
			site,
			translate,
			isSiteAT,
			hideMonthly,
			isInSignupTest
		} = this.props;

		const isDiscounted = !! discountPrice;
		const timeframeClasses = classNames( 'plan-features__header-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder
		} );

		if ( isInSignupTest ) {
			return (
				<span>
					<span>{ billingTimeFrame }</span>
				</span>
			);
		}

		if (
			isSiteAT ||
			! site.jetpack ||
			this.props.planType === PLAN_JETPACK_FREE ||
			hideMonthly
		) {
			return (
				<p className={ timeframeClasses }>
					{ ! isPlaceholder ? billingTimeFrame : '' }
					{ isDiscounted && ! isPlaceholder &&
						<InfoPopover
							className="plan-features__header-tip-info"
							position={ isMobile() ? 'top' : 'bottom left' }>
							{ translate( 'Discount for first year' ) }
						</InfoPopover>
					}
				</p>
			);
		}

		return this.getIntervalTypeToggle();
	}

	getIntervalTypeToggle() {
		const {
			translate,
			rawPrice,
			intervalType,
			site,
			basePlansPath,
			hideMonthly,
			currentSitePlan,
		} = this.props;

		if ( hideMonthly ||
			! rawPrice ||
			// Only monthly to yearly upgrades for the same plan are supported
			( this.isPlanCurrent() && currentSitePlan && ! isMonthly( currentSitePlan.productSlug ) )
		) {
			return (
				<div className="plan-features__interval-type is-placeholder">
				</div>
			);
		}

		let plansUrl = '/plans';
		if ( basePlansPath ) {
			plansUrl = basePlansPath;
		}

		return (
			<SegmentedControl compact className="plan-features__interval-type" primary={ true }>
				<SegmentedControlItem
					selected={ intervalType === 'monthly' }
					path={ plansLink( plansUrl, site, 'monthly' ) }
				>
					{ translate( 'Monthly' ) }
				</SegmentedControlItem>

				<SegmentedControlItem
					selected={ intervalType === 'yearly' }
					path={ plansLink( plansUrl, site, 'yearly' ) }
				>
					{ translate( 'Yearly' ) }
				</SegmentedControlItem>
			</SegmentedControl>
		);
	}

	isPlanCurrent() {
		const {
			planType,
			current,
			currentSitePlan
		} = this.props;

		if ( ! currentSitePlan ) {
			return current;
		}

		return getPlanClass( planType ) === getPlanClass( currentSitePlan.productSlug );
	}

	getPlanFeaturesPrices() {
		const {
			currencyCode,
			discountPrice,
			rawPrice,
			isPlaceholder,
			relatedMonthlyPlan,
			site,
			isInSignupTest
		} = this.props;

		if ( isPlaceholder && ! isInSignupTest ) {
			const isJetpackSite = !! site.jetpack;
			const classes = classNames( 'is-placeholder', {
				'plan-features__price': ! isJetpackSite,
				'plan-features__price-jetpack': isJetpackSite
			} );

			return (
				<div className={ classes } ></div>
			);
		}

		if ( discountPrice ) {
			return (
				<span className="plan-features__header-price-group">
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ rawPrice }
						isInSignupTest={ isInSignupTest }
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ discountPrice }
						isInSignupTest={ isInSignupTest }
						discounted
					/>
				</span>
			);
		}

		if ( relatedMonthlyPlan ) {
			const originalPrice = relatedMonthlyPlan.raw_price * 12;
			return (
				<span className="plan-features__header-price-group">
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ originalPrice }
						isInSignupTest={ isInSignupTest }
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ rawPrice }
						isInSignupTest={ isInSignupTest }
						discounted
					/>
				</span>
			);
		}

		return (
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ rawPrice }
				isInSignupTest={ isInSignupTest }
			/>
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
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PERSONAL
	] ).isRequired,
	popular: PropTypes.bool,
	newPlan: PropTypes.bool,
	rawPrice: PropTypes.number,
	discountPrice: PropTypes.number,
	currencyCode: PropTypes.string,
	title: PropTypes.string.isRequired,
	isPlaceholder: PropTypes.bool,
	translate: PropTypes.func,
	intervalType: PropTypes.string,
	site: PropTypes.object,
	isInJetpackConnect: PropTypes.bool,
	currentSitePlan: PropTypes.object,
	relatedMonthlyPlan: PropTypes.object,
	isSiteAT: PropTypes.bool
};

PlanFeaturesHeader.defaultProps = {
	current: false,
	onClick: noop,
	popular: false,
	newPlan: false,
	isPlaceholder: false,
	intervalType: 'yearly',
	site: {},
	basePlansPath: null,
	currentSitePlan: {},
	isSiteAT: false
};

export default connect( ( state, ownProps ) => {
	const { isInSignup } = ownProps;
	const selectedSiteId = isInSignup ? null : getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	return Object.assign( {},
		ownProps,
		{
			currentSitePlan,
			isSiteAT: isSiteAutomatedTransfer( state, selectedSiteId )
		}
	);
} )( localize( PlanFeaturesHeader ) );
