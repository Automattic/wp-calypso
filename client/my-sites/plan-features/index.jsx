/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, reduce, noop, compact } from 'lodash';
import page from 'page';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import PlanFeaturesActions from './actions';
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
import { retargetViewPlans } from 'lib/analytics/ad-tracking';
import { abtest } from 'lib/abtest';

class PlanFeatures extends Component {
	render() {
		const { planProperties, isInSignup } = this.props;
		const tableClasses = classNames(
			'plan-features__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', { 'plan-features--signup': isInSignup } );
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
				<div className={ planClasses }>
					{ this.renderUpgradeDisabledNotice() }
					<div className="plan-features__content">
						{ mobileView }
						<table className={ tableClasses }>
							<tbody>
								<tr>{ this.renderPlanHeaders() }</tr>
								{ planDescriptions }
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
			displayJetpackPlans ? ( plansWrapper.scrollLeft = 190 ) : ( plansWrapper.scrollLeft = 495 );
		}
	};

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
			canPurchase,
			translate,
			planProperties,
			isInSignup,
			isLandingPage,
			site,
			basePlansPath,
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
				relatedMonthlyPlan,
				primaryUpgrade,
				isPlaceholder,
				hideMonthly,
			} = properties;
			const { rawPrice, discountPrice } = properties;
			return (
				<div className="plan-features__mobile-plan" key={ planName }>
					<PlanFeaturesHeader
						current={ current }
						currencyCode={ currencyCode }
						popular={ popular }
						newPlan={ newPlan }
						title={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						discountPrice={ discountPrice }
						billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
						hideMonthly={ hideMonthly }
						isPlaceholder={ isPlaceholder }
						site={ site }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						isInSignup={ isInSignup }
					/>
					<p className="plan-features__description">{ planConstantObj.getDescription( abtest ) }</p>
					<PlanFeaturesActions
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						primaryUpgrade={ primaryUpgrade }
						available={ available }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isPopular={ popular }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
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
			planProperties,
			site,
			basePlansPath,
			isInSignup,
			siteType,
			displayJetpackPlans,
		} = this.props;

		return map( planProperties, properties => {
			const {
				currencyCode,
				current,
				planConstantObj,
				planName,
				popular,
				newPlan,
				relatedMonthlyPlan,
				isPlaceholder,
				hideMonthly,
			} = properties;
			const { rawPrice, discountPrice } = properties;
			const classes = classNames( 'plan-features__table-item', 'has-border-top' );
			let audience = planConstantObj.getAudience();
			let billingTimeFrame = planConstantObj.getBillingTimeFrame();

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
				billingTimeFrame = planConstantObj.getSignupBillingTimeFrame();
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesHeader
						current={ current }
						currencyCode={ currencyCode }
						popular={ popular }
						newPlan={ newPlan }
						title={ planConstantObj.getTitle() }
						audience={ audience }
						planType={ planName }
						rawPrice={ rawPrice }
						discountPrice={ discountPrice }
						billingTimeFrame={ billingTimeFrame }
						isPlaceholder={ isPlaceholder }
						site={ site }
						hideMonthly={ hideMonthly }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						isInSignup={ isInSignup }
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
		const { canPurchase, isLandingPage, planProperties, isInSignup, site } = this.props;

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
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						available={ available }
						primaryUpgrade={ primaryUpgrade }
						planName={ planConstantObj.getTitle() }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						manageHref={ `/plans/my-plan/${ site.slug }` }
						planType={ planName }
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
		const { canPurchase, planProperties, isInSignup, isLandingPage, site } = this.props;

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
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						available={ available }
						primaryUpgrade={ primaryUpgrade }
						planName={ planConstantObj.getTitle() }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isPopular={ popular }
						manageHref={ `/plans/my-plan/${ site.slug }` }
						planType={ planName }
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
		const planProperties = compact(
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
					hideMonthly: false,
					primaryUpgrade:
						( currentPlan === PLAN_PERSONAL && plan === PLAN_PREMIUM ) ||
						( currentPlan === PLAN_PREMIUM && plan === PLAN_BUSINESS ) ||
						popular ||
						newPlan ||
						plans.length === 1,
					rawPrice: getPlanRawPrice( state, planProductId, showMonthlyPrice ),
					relatedMonthlyPlan: relatedMonthlyPlan,
				};
			} )
		);

		return {
			canPurchase,
			planProperties,
			siteType,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeatures ) );
