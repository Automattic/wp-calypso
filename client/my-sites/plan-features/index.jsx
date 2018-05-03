/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compact, map, noop, reduce } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import formatCurrency from 'lib/format-currency';
import Notice from 'components/notice';
import PlanFeaturesActions from './actions';
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import PlanFeaturesSummary from './summary';
import SpinnerLine from 'components/spinner-line';
import QueryActivePromotions from 'components/data/query-active-promotions';
import { abtest, getABTestVariation } from 'lib/abtest';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlan, getPlanBySlug, getPlanRawPrice, getPlanSlug } from 'state/plans/selectors';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';
import { retargetViewPlans } from 'lib/analytics/ad-tracking';
import {
	canUpgradeToPlan,
	isCurrentUserEligibleForSpringDiscount as isEligibleForSpringDiscount,
} from 'state/selectors';
import {
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getPlanPath,
	isFreePlan,
} from 'lib/plans';
import {
	getPlanDiscountedRawPrice,
	getPlansBySiteId,
	isCurrentUserCurrentPlanOwner,
} from 'state/sites/plans/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isCurrentPlanPaid,
	isCurrentSitePlan,
	isJetpackSite,
} from 'state/sites/selectors';
import {
	isBestValue,
	isMonthly,
	isNew,
	isPopular,
	getPlanFeaturesObject,
	getPlanClass,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	GROUP_WPCOM,
} from 'lib/plans/constants';

class PlanFeatures extends Component {
	componentDidMount() {
		const { basePlansPath, isInSignup } = this.props;
		// Check if user is in signup flow & small screens
		// Used in AB test: mobilePlansTablesOnSignup_20180330
		if ( isInSignup && window.matchMedia( '(max-width: 660px)' ).matches ) {
			this.props.recordTracksEvent( 'calypso_wp_plans_verticalabtest_view', {
				base_plans_path: basePlansPath,
			} );
		}
	}

	render() {
		const { isInSignup, isJetpack, planProperties, showModifiedPricingDisplay } = this.props;
		const tableClasses = classNames(
			'plan-features__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', {
			'abtest-pricing-display': showModifiedPricingDisplay,
			'has-mobile-table': abtest( 'mobilePlansTablesOnSignup' ) === 'vertical',
			'plan-features--signup': isInSignup,
		} );
		const planWrapperClasses = classNames( { 'plans-wrapper': isInSignup } );
		let mobileView, planDescriptions;
		let bottomButtons = null;

		if ( ! isInSignup ) {
			planDescriptions = <tr>{ this.renderPlanDescriptions() }</tr>;

			bottomButtons = <tr>{ this.renderBottomButtons() }</tr>;
		}

		mobileView = <div className="plan-features__mobile">{ this.renderMobileView() }</div>;

		if ( isInSignup && abtest( 'mobilePlansTablesOnSignup' ) === 'original' ) {
			mobileView = '';
		}

		return (
			<div className={ planWrapperClasses } ref={ this.setScrollLeft }>
				<QueryActivePromotions />
				{ showModifiedPricingDisplay && ! isJetpack && this.renderCreditNotice() }
				<div className={ planClasses }>
					{ this.renderUpgradeDisabledNotice() }
					{ this.render30PercentOffNotice() }
					<div className="plan-features__content">
						{ mobileView }
						<table className={ tableClasses }>
							<tbody>
								<tr>{ this.renderPlanHeaders() }</tr>
								{ planDescriptions }
								<tr>{ showModifiedPricingDisplay && this.renderCreditSummary() }</tr>
								<tr>{ this.renderTopButtons() }</tr>
								{ this.renderPlanFeatureRows() }
								{ bottomButtons }
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}

	setScrollLeft = plansWrapper => {
		const { isInSignup, displayJetpackPlans } = this.props;

		// center plans
		if ( isInSignup && plansWrapper ) {
			displayJetpackPlans ? ( plansWrapper.scrollLeft = 312 ) : ( plansWrapper.scrollLeft = 495 );
		}
	};

	renderCreditNotice() {
		const { canPurchase, hasPlaceholders, maxCredits, translate } = this.props;
		const bannerContainer = document.querySelector( '.plans-features-main__notice' );

		if ( hasPlaceholders || ! canPurchase || ! bannerContainer || ! maxCredits.amount ) {
			return null;
		}

		return ReactDOM.createPortal(
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ false }
				icon="info-outline"
				status="is-success"
			>
				{ translate(
					'You have {{b}}%(credits)s{{/b}} in upgrade credits available! ' +
						'Apply the value of your current plan towards an upgrade before your credits expire!',
					{
						args: {
							credits: formatCurrency( maxCredits.amount, maxCredits.currencyCode ),
						},
						components: {
							b: <strong />,
						},
					}
				) }
			</Notice>,
			bannerContainer
		);
	}

	render30PercentOffNotice() {
		const {
			canPurchase,
			hasPlaceholders,
			withSaleInfo,
			isEligibleForSpringDiscount: eligible,
		} = this.props;
		const bannerContainer = document.querySelector( '.plans-features-main__notice' );

		if ( ! bannerContainer ) {
			return false;
		}

		if ( ! eligible || ! withSaleInfo || hasPlaceholders || ! canPurchase ) {
			return ReactDOM.createPortal( <div />, bannerContainer );
		}

		return ReactDOM.createPortal(
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ false }
				icon="info-outline"
				status="is-success"
			>
				{ /* no translate() since we're launching this just for EN audience */ }
				{ 'Enter coupon code “SPRING30” during checkout to claim your 30% discount' }
			</Notice>,
			bannerContainer
		);
	}

	renderCreditSummary() {
		const { canPurchase, isJetpack, planProperties } = this.props;

		return map( planProperties, properties => {
			const {
				available,
				currencyCode,
				current,
				discountPrice,
				planConstantObj,
				planName,
				rawPrice,
				relatedMonthlyPlan,
			} = properties;

			return (
				<td key={ planName } className="plan-features__table-item">
					<PlanFeaturesSummary
						available={ available }
						canPurchase={ canPurchase }
						currencyCode={ currencyCode }
						current={ current }
						discountPrice={ discountPrice }
						isJetpack={ isJetpack }
						planTitle={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						relatedMonthlyPlan={ relatedMonthlyPlan }
					/>
				</td>
			);
		} );
	}

	renderUpgradeDisabledNotice() {
		const { canPurchase, hasPlaceholders, translate } = this.props;

		if ( hasPlaceholders || canPurchase ) {
			return null;
		}

		return (
			<Notice className="plan-features__notice" showDismiss={ false } status="is-info">
				{ translate( 'You need to be the plan owner to manage this site.' ) }
			</Notice>
		);
	}

	renderMobileView() {
		const {
			basePlansPath,
			canPurchase,
			isInSignup,
			isLandingPage,
			isJetpack,
			planProperties,
			selectedPlan,
			translate,
		} = this.props;

		// move any free plan to last place in mobile view
		let freePlanProperties;
		const reorderedPlans = planProperties.filter( properties => {
			if ( isFreePlan( properties.planName ) ) {
				freePlanProperties = properties;
				return false;
			}
			return true;
		} );

		if ( freePlanProperties ) {
			reorderedPlans.push( freePlanProperties );
		}

		return map( reorderedPlans, properties => {
			const {
				available,
				currencyCode,
				current,
				features,
				onUpgradeClick,
				planConstantObj,
				planName,
				popular,
				newPlan,
				bestValue,
				relatedMonthlyPlan,
				primaryUpgrade,
				isPlaceholder,
				hideMonthly,
				showModifiedPricingDisplay,
			} = properties;
			const { rawPrice, discountPrice } = properties;
			return (
				<div className="plan-features__mobile-plan" key={ planName }>
					<PlanFeaturesHeader
						available={ available }
						current={ current }
						currencyCode={ currencyCode }
						isJetpack={ isJetpack }
						popular={ popular }
						newPlan={ newPlan }
						bestValue={ bestValue }
						title={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						discountPrice={ discountPrice }
						billingTimeFrame={ planConstantObj.getBillingTimeFrame( getABTestVariation ) }
						hideMonthly={ hideMonthly }
						isPlaceholder={ isPlaceholder }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						isInSignup={ isInSignup }
						selectedPlan={ selectedPlan }
						showModifiedPricingDisplay={ showModifiedPricingDisplay }
					/>
					<p className="plan-features__description">{ planConstantObj.getDescription( abtest ) }</p>
					<PlanFeaturesActions
						available={ available }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						onUpgradeClick={ onUpgradeClick }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						selectedPlan={ selectedPlan }
					/>
					<FoldableCard header={ translate( 'Show features' ) } clickableHeader compact>
						{ this.renderMobileFeatures( features ) }
					</FoldableCard>
				</div>
			);
		} );
	}

	renderMobileFeatures( features ) {
		return map( features, ( currentFeature, index ) => {
			return currentFeature ? this.renderFeatureItem( currentFeature, index ) : null;
		} );
	}

	renderPlanHeaders() {
		const {
			basePlansPath,
			displayJetpackPlans,
			isInSignup,
			isJetpack,
			planProperties,
			selectedPlan,
			siteType,
			showModifiedPricingDisplay,
		} = this.props;

		return map( planProperties, properties => {
			const {
				available,
				currencyCode,
				current,
				planConstantObj,
				planName,
				popular,
				newPlan,
				bestValue,
				relatedMonthlyPlan,
				isPlaceholder,
				hideMonthly,
			} = properties;
			const { rawPrice, discountPrice } = properties;
			const classes = classNames( 'plan-features__table-item', 'has-border-top' );
			let audience = planConstantObj.getAudience();
			let billingTimeFrame = planConstantObj.getBillingTimeFrame( getABTestVariation );

			if ( isInSignup && ! displayJetpackPlans ) {
				switch ( siteType ) {
					case 'blog':
						audience = planConstantObj.getBlogAudience();
						break;
					case 'grid':
						audience = planConstantObj.getPortfolioAudience();
						break;
					case 'store':
						audience = planConstantObj.getStoreAudience();
						break;
					default:
						audience = planConstantObj.getAudience();
				}
			}

			if ( isInSignup && displayJetpackPlans ) {
				billingTimeFrame = planConstantObj.getSignupBillingTimeFrame( abtest );
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesHeader
						audience={ audience }
						available={ available }
						basePlansPath={ basePlansPath }
						billingTimeFrame={ billingTimeFrame }
						current={ current }
						currencyCode={ currencyCode }
						discountPrice={ discountPrice }
						hideMonthly={ hideMonthly }
						isInSignup={ isInSignup }
						isJetpack={ isJetpack }
						isPlaceholder={ isPlaceholder }
						newPlan={ newPlan }
						bestValue={ bestValue }
						planType={ planName }
						popular={ popular }
						rawPrice={ rawPrice }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						selectedPlan={ selectedPlan }
						title={ planConstantObj.getTitle() }
						showModifiedPricingDisplay={ showModifiedPricingDisplay }
					/>
				</td>
			);
		} );
	}

	renderPlanDescriptions() {
		const { planProperties } = this.props;

		return map( planProperties, properties => {
			const { planName, planConstantObj, isPlaceholder } = properties;

			const classes = classNames( 'plan-features__table-item', {
				'is-placeholder': isPlaceholder,
			} );

			return (
				<td key={ planName } className={ classes }>
					{ isPlaceholder ? <SpinnerLine /> : null }

					<p className="plan-features__description">{ planConstantObj.getDescription( abtest ) }</p>
				</td>
			);
		} );
	}

	renderTopButtons() {
		const {
			canPurchase,
			isInSignup,
			isLandingPage,
			planProperties,
			selectedPlan,
			selectedSiteSlug,
		} = this.props;

		return map( planProperties, properties => {
			const {
				available,
				current,
				onUpgradeClick,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;

			const classes = classNames(
				'plan-features__table-item',
				'has-border-bottom',
				'is-top-buttons'
			);

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						available={ available }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						manageHref={ `/plans/my-plan/${ selectedSiteSlug }` }
						onUpgradeClick={ onUpgradeClick }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						selectedPlan={ selectedPlan }
					/>
				</td>
			);
		} );
	}

	getLongestFeaturesList() {
		const { planProperties } = this.props;

		return reduce(
			planProperties,
			( longest, properties ) => {
				const currentFeatures = Object.keys( properties.features );
				return currentFeatures.length > longest.length ? currentFeatures : longest;
			},
			[]
		);
	}

	renderPlanFeatureRows() {
		const longestFeatures = this.getLongestFeaturesList();
		return map( longestFeatures, ( featureKey, rowIndex ) => {
			return (
				<tr key={ rowIndex } className="plan-features__row">
					{ this.renderPlanFeatureColumns( rowIndex ) }
				</tr>
			);
		} );
	}

	renderFeatureItem( feature, index ) {
		const description = feature.getDescription
			? feature.getDescription( abtest, this.props.domainName )
			: null;
		return (
			<PlanFeaturesItem
				key={ index }
				description={ description }
				hideInfoPopover={ feature.hideInfoPopover }
			>
				<span className="plan-features__item-info">
					<span className="plan-features__item-title">{ feature.getTitle() }</span>
				</span>
			</PlanFeaturesItem>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const { planProperties, selectedFeature } = this.props;

		return map( planProperties, properties => {
			const { features, planName } = properties;

			const featureKeys = Object.keys( features ),
				key = featureKeys[ rowIndex ],
				currentFeature = features[ key ];

			const classes = classNames( 'plan-features__table-item', getPlanClass( planName ), {
				'has-partial-border': rowIndex + 1 < featureKeys.length,
				'is-highlighted':
					selectedFeature && currentFeature && selectedFeature === currentFeature.getSlug(),
			} );

			return currentFeature ? (
				<td key={ `${ planName }-${ key }` } className={ classes }>
					{ this.renderFeatureItem( currentFeature ) }
				</td>
			) : (
				<td key={ `${ planName }-none` } className="plan-features__table-item" />
			);
		} );
	}

	renderBottomButtons() {
		const {
			canPurchase,
			isInSignup,
			isLandingPage,
			planProperties,
			selectedPlan,
			selectedSiteSlug,
		} = this.props;

		return map( planProperties, properties => {
			const {
				available,
				current,
				onUpgradeClick,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;
			const classes = classNames(
				'plan-features__table-item',
				'has-border-bottom',
				'is-bottom-buttons'
			);
			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						available={ available }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						manageHref={ `/plans/my-plan/${ selectedSiteSlug }` }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						onUpgradeClick={ onUpgradeClick }
						selectedPlan={ selectedPlan }
					/>
				</td>
			);
		} );
	}

	componentWillMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}
}

PlanFeatures.propTypes = {
	basePlansPath: PropTypes.string,
	canPurchase: PropTypes.bool.isRequired,
	displayJetpackPlans: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isJetpack: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	selectedSiteSlug: PropTypes.string,
	siteId: PropTypes.number,
};

PlanFeatures.defaultProps = {
	basePlansPath: null,
	displayJetpackPlans: false,
	isInSignup: false,
	isJetpack: false,
	selectedSiteSlug: '',
	siteId: null,
	onUpgradeClick: noop,
};

function getMaxCredits( planProperties, isJetpack ) {
	return planProperties.reduce(
		( prev, prop ) => {
			let current = 0;
			if ( prop.discountPrice ) {
				current = prop.rawPrice - prop.discountPrice;
				if ( ! isJetpack ) {
					current = current * 12;
				}
			} else if ( prop.relatedMonthlyPlan ) {
				current = prop.relatedMonthlyPlan.raw_price * 12 - prop.rawPrice;
			}

			if ( current > prev.amount ) {
				return {
					amount: current,
					currencyCode: prop.currencyCode,
				};
			}

			return prev;
		},
		{ amount: 0, currencyCode: '' }
	);
}

export const isPrimaryUpgradeByPlanDelta = ( currentPlan, plan ) =>
	( planMatches( currentPlan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) );

export default connect(
	( state, ownProps ) => {
		const {
			isInSignup,
			placeholder,
			plans,
			onUpgradeClick,
			isLandingPage,
			siteId,
			displayJetpackPlans,
		} = ownProps;
		const selectedSiteId = siteId;
		const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
		// If no site is selected, fall back to use the `displayJetpackPlans` prop's value
		const isJetpack = selectedSiteId ? isJetpackSite( state, selectedSiteId ) : displayJetpackPlans;
		const sitePlan = getSitePlan( state, selectedSiteId );
		const sitePlans = getPlansBySiteId( state, selectedSiteId );
		const isPaid = isCurrentPlanPaid( state, selectedSiteId );
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;
		const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, selectedSiteId );

		const planProperties = compact(
			map( plans, plan => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isLoadingSitePlans = selectedSiteId && ! sitePlans.hasLoadedFromServer;
				const showMonthly = ! isMonthly( plan );
				const available = isInSignup
					? true
					: canUpgradeToPlan( state, selectedSiteId, plan ) && canPurchase;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = isPopular( plan ) && ! isPaid;
				const newPlan = isNew( plan ) && ! isPaid;
				const bestValue = isBestValue( plan ) && ! isPaid;
				const currentPlan = sitePlan && sitePlan.product_slug;
				const showMonthlyPrice = ! relatedMonthlyPlan && showMonthly;
				let planFeatures = getPlanFeaturesObject( planConstantObj.getFeatures( abtest ) );

				if ( placeholder || ! planObject || isLoadingSitePlans ) {
					isPlaceholder = true;
				}

				if ( isInSignup ) {
					switch ( siteType ) {
						case 'blog':
							if ( planConstantObj.getBlogSignupFeatures ) {
								planFeatures = getPlanFeaturesObject(
									planConstantObj.getBlogSignupFeatures( abtest )
								);
							}

							break;
						case 'grid':
							if ( planConstantObj.getPortfolioSignupFeatures ) {
								planFeatures = getPlanFeaturesObject(
									planConstantObj.getPortfolioSignupFeatures( abtest )
								);
							}

							break;
						default:
							if ( planConstantObj.getSignupFeatures ) {
								planFeatures = getPlanFeaturesObject( planConstantObj.getSignupFeatures( abtest ) );
							}
					}
				}

				if ( displayJetpackPlans ) {
					planFeatures = getPlanFeaturesObject( planConstantObj.getSignupFeatures( abtest ) );
				}

				return {
					available: available,
					currencyCode: getCurrentUserCurrencyCode( state ),
					current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
					discountPrice: getPlanDiscountedRawPrice( state, selectedSiteId, plan, {
						isMonthly: showMonthlyPrice,
					} ),
					features: planFeatures,
					isLandingPage,
					isPlaceholder,
					onUpgradeClick: onUpgradeClick
						? () => {
								const planSlug = getPlanSlug( state, planProductId );

								onUpgradeClick( getCartItemForPlan( planSlug ) );
							}
						: () => {
								if ( ! available ) {
									return;
								}

								page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( plan ) || '' }` );
							},
					planConstantObj,
					planName: plan,
					planObject: planObject,
					popular: popular,
					newPlan: newPlan,
					bestValue: bestValue,
					hideMonthly: false,
					primaryUpgrade:
						isPrimaryUpgradeByPlanDelta( currentPlan, plan ) ||
						popular ||
						newPlan ||
						bestValue ||
						plans.length === 1,
					rawPrice: getPlanRawPrice( state, planProductId, showMonthlyPrice ),
					relatedMonthlyPlan,
				};
			} )
		);

		const maxCredits = getMaxCredits( planProperties, isJetpack );
		const showModifiedPricingDisplay =
			! isInSignup &&
			isPaid &&
			!! maxCredits.amount &&
			abtest( 'upgradePricingDisplayV3' ) === 'modified';

		return {
			canPurchase,
			isJetpack,
			maxCredits,
			planProperties,
			selectedSiteSlug,
			showModifiedPricingDisplay,
			sitePlan,
			siteType,

			isEligibleForSpringDiscount: isEligibleForSpringDiscount( state ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeatures ) );
