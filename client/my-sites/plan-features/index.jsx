/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { map, reduce, noop, compact, filter, reject } from 'lodash';
import page from 'page';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import PlanFeaturesActions from './actions';
import PlanFeaturesBottom from './bottom';
import PlanFeaturesSummary from './summary';
import {
	isCurrentPlanPaid,
	isCurrentSitePlan,
	getSitePlan,
	getSiteSlug,
} from 'state/sites/selectors';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { isCurrentUserCurrentPlanOwner, getPlansBySiteId } from 'state/sites/plans/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice, getPlan, getPlanSlug, getPlanBySlug } from 'state/plans/selectors';
import {
	isPopular,
	isNew,
	isBestValue,
	isMonthly,
	getPlanFeaturesObject,
	getPlanClass,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
} from 'lib/plans/constants';
import { getMonthlyPlanByYearly, isFreePlan } from 'lib/plans';
import { getPlanPath, canUpgradeToPlan, applyTestFiltersToPlansList } from 'lib/plans';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import Notice from 'components/notice';
import SpinnerLine from 'components/spinner-line';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent } from 'state/analytics/actions';
import formatCurrency from 'lib/format-currency';
import { retargetViewPlans } from 'lib/analytics/ad-tracking';
import { abtest, getABTestVariation } from 'lib/abtest';

class PlanFeatures extends Component {
	render() {
		const { planProperties, isInSignup, showModifiedPricingDisplay } = this.props;
		const tableClasses = classNames(
			'plan-features__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', {
			'plan-features--signup': isInSignup,
			'abtest-pricing-display': showModifiedPricingDisplay,
		} );
		const planWrapperClasses = classNames( { 'plans-wrapper': isInSignup } );
		let mobileView, planDescriptions;
		let bottomButtons = null;

		if ( ! isInSignup ) {
			mobileView = <div className="plan-features__mobile">{ this.renderMobileView() }</div>;

			planDescriptions = <tr>{ this.renderPlanDescriptions() }</tr>;

			bottomButtons = <tr>{ this.renderBottomButtons() }</tr>;
		}

		return (
			<div className={ planWrapperClasses } ref={ this.setScrollLeft }>
				{ showModifiedPricingDisplay && this.renderCreditNotice() }
				<div className={ planClasses }>
					{ this.renderUpgradeDisabledNotice() }
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
				{ isInSignup && this.renderFarBottomAction() }
			</div>
		);
	}

	setScrollLeft = plansWrapper => {
		const { isInSignup, displayJetpackPlans } = this.props;

		// center plans
		if ( isInSignup && plansWrapper ) {
			displayJetpackPlans ? ( plansWrapper.scrollLeft = 190 ) : ( plansWrapper.scrollLeft = 495 );
		}
	};

	renderCreditNotice() {
		const { canPurchase, hasPlaceholders, planProperties, site, translate } = this.props;
		const bannerContainer = document.querySelector( '.plans-features-main__notice' );

		if ( hasPlaceholders || ! canPurchase || ! bannerContainer ) {
			return null;
		}

		const credits = planProperties.reduce(
			( prev, prop ) => {
				let current = 0;
				if ( prop.discountPrice ) {
					current = prop.rawPrice - prop.discountPrice;
					if ( ! site.jetpack ) {
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

		if ( ! credits.amount ) {
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
							credits: formatCurrency( credits.amount, credits.currencyCode ),
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

	renderCreditSummary() {
		const { canPurchase, planProperties, site, sitePlan } = this.props;

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
						currentPlanTitle={ sitePlan.product_name_short }
						discountPrice={ discountPrice }
						planTitle={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						site={ site }
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
			planProperties,
			selectedPlan,
			site,
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
						site={ site }
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
			planProperties,
			selectedPlan,
			site,
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
			let billingTimeFrame = planConstantObj.getBillingTimeFrame( abtest );

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
						isPlaceholder={ isPlaceholder }
						newPlan={ newPlan }
						bestValue={ bestValue }
						planType={ planName }
						popular={ popular }
						rawPrice={ rawPrice }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						site={ site }
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
			site,
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
						manageHref={ `/plans/my-plan/${ site.slug }` }
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
			site,
			selectedPlan,
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
						manageHref={ `/plans/my-plan/${ site.slug }` }
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

	renderFarBottomAction() {
		const {
			canPurchase,
			isInSignup,
			isLandingPage,
			freePlanProperties,
			site,
			selectedPlan,
		} = this.props;
		const {
			available,
			current,
			onUpgradeClick,
			planName,
			primaryUpgrade,
			isPlaceholder,
			planConstantObj,
			popular,
		} =
			freePlanProperties || {};

		if ( ! freePlanProperties ) {
			return null;
		}

		return (
			<PlanFeaturesBottom>
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
					manageHref={ `/plans/my-plan/${ site.slug }` }
					planName={ planConstantObj.getTitle() }
					planType={ planName }
					primaryUpgrade={ primaryUpgrade }
					onUpgradeClick={ onUpgradeClick }
					selectedPlan={ selectedPlan }
				/>
			</PlanFeaturesBottom>
		);
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
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	site: PropTypes.object,
};

PlanFeatures.defaultProps = {
	basePlansPath: null,
	displayJetpackPlans: false,
	isInSignup: false,
	site: {},
	onUpgradeClick: noop,
};

function filterFreePlan( { planName } ) {
	return isFreePlan( planName );
}

export default connect(
	( state, ownProps ) => {
		const {
			isInSignup,
			placeholder,
			plans,
			onUpgradeClick,
			isLandingPage,
			site,
			displayJetpackPlans,
		} = ownProps;
		const selectedSiteId = site ? site.ID : null;
		const sitePlan = getSitePlan( state, selectedSiteId );
		const sitePlans = getPlansBySiteId( state, selectedSiteId );
		const isPaid = isCurrentPlanPaid( state, selectedSiteId );
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;
		const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, selectedSiteId );
		const showModifiedPricingDisplay =
			! isInSignup && abtest( 'upgradePricingDisplay' ) === 'modified';
		let freePlanProperties = null;
		let planProperties = compact(
			map( plans, plan => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isLoadingSitePlans = selectedSiteId && ! sitePlans.hasLoadedFromServer;
				const showMonthly = ! isMonthly( plan );
				const available = isInSignup ? true : canUpgradeToPlan( plan, site ) && canPurchase;
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
					isPlaceholder,
					isLandingPage,
					available: available,
					currencyCode: getCurrentUserCurrencyCode( state ),
					current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
					discountPrice: getPlanDiscountedRawPrice( state, selectedSiteId, plan, {
						isMonthly: showMonthlyPrice,
					} ),
					features: planFeatures,
					onUpgradeClick: onUpgradeClick
						? () => {
								const planSlug = getPlanSlug( state, planProductId );

								onUpgradeClick( getCartItemForPlan( planSlug ) );
							}
						: () => {
								if ( ! available ) {
									return;
								}

								const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
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
						( currentPlan === PLAN_PERSONAL && plan === PLAN_PREMIUM ) ||
						( currentPlan === PLAN_PREMIUM && plan === PLAN_BUSINESS ) ||
						popular ||
						newPlan ||
						bestValue ||
						plans.length === 1,
					rawPrice: getPlanRawPrice( state, planProductId, showMonthlyPrice ),
					relatedMonthlyPlan,
				};
			} )
		);

		if ( isInSignup && abtest( 'minimizeFreePlan' ) === 'minimized' ) {
			freePlanProperties = filter( planProperties, filterFreePlan );
			freePlanProperties = freePlanProperties[ 0 ] || null;
			planProperties = reject( planProperties, filterFreePlan );
		}

		return {
			canPurchase,
			planProperties,
			freePlanProperties,
			siteType,
			sitePlan,
			showModifiedPricingDisplay,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeatures ) );
