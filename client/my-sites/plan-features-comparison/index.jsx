/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compact, get, map, reduce } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import PlanFeaturesComparisonActions from './actions';
import PlanFeaturesComparisonHeader from './header';
import { PlanFeaturesAvailableItem } from './item';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import { abtest } from 'calypso/lib/abtest';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
	getDiscountedRawPrice,
} from 'calypso/state/plans/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getDiscountByName } from 'calypso/lib/discounts';
import { addQueryArgs } from '@automattic/calypso-url';
import {
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	getPlanPath,
	isWpComEcommercePlan,
	isWpComBusinessPlan,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getPlanClass,
	isFreePlan,
} from 'calypso/lib/plans';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
	getPlansBySiteId,
	isCurrentUserCurrentPlanOwner,
} from 'calypso/state/sites/plans/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isCurrentPlanPaid,
	isCurrentSitePlan,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import {
	isBestValue,
	isMonthly,
	isNew,
	PLAN_FREE,
	TERM_MONTHLY,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	GROUP_WPCOM,
	FEATURE_BUSINESS_ONBOARDING,
	TYPE_P2_PLUS,
	TYPE_FREE,
} from 'calypso/lib/plans/constants';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => {};

export class PlanFeaturesComparison extends Component {
	render() {
		const { isInSignup, planProperties, translate } = this.props;
		const tableClasses = classNames(
			'plan-features-comparison__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', {
			'plan-features--signup': isInSignup,
		} );
		const planWrapperClasses = classNames( {
			'plans-wrapper': isInSignup,
		} );

		return (
			<div className={ planWrapperClasses }>
				<QueryActivePromotions />
				<div className={ planClasses }>
					{ this.renderNotice() }
					<div ref={ this.contentRef } className="plan-features-comparison__content">
						<div>
							<table className={ tableClasses }>
								<caption className="plan-features-comparison__screen-reader-text screen-reader-text">
									{ translate( 'Available plans to choose from' ) }
								</caption>
								<tbody>
									<tr>{ this.renderPlanHeaders() }</tr>
									<tr>{ this.renderTopButtons() }</tr>
									{ this.renderPlanFeatureRows() }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderNotice() {
		return this.renderDiscountNotice();
	}

	renderDiscountNotice() {
		if ( ! this.hasDiscountNotice() ) {
			return false;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}
		const activeDiscount = getDiscountByName( this.props.withDiscount, this.props.discountEndDate );
		return ReactDOM.createPortal(
			<Notice
				className="plan-features-comparison__notice-credits"
				showDismiss={ false }
				icon="info-outline"
				status="is-success"
			>
				{ activeDiscount.plansPageNoticeTextTitle && (
					<strong>
						{ activeDiscount.plansPageNoticeTextTitle }
						{ <br /> }
					</strong>
				) }
				{ activeDiscount.plansPageNoticeText }
			</Notice>,
			bannerContainer
		);
	}

	hasDiscountNotice() {
		const { canPurchase, hasPlaceholders, withDiscount, discountEndDate } = this.props;
		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}

		const activeDiscount = getDiscountByName( withDiscount, discountEndDate );
		if ( ! activeDiscount || hasPlaceholders || ! canPurchase ) {
			return false;
		}

		return true;
	}

	getBannerContainer() {
		return document.querySelector( '.plans-features-main__notice' );
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
			showPlanCreditsApplied,
			withScroll,
		} = this.props;

		return map( planProperties, ( properties ) => {
			const {
				availableForPurchase,
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
				rawPrice,
				rawPriceAnnual,
				rawPriceForMonthlyPlan,
			} = properties;
			const { discountPrice } = properties;
			const classes = classNames( 'plan-features-comparison__table-item', 'has-border-top' );
			let audience = planConstantObj.getAudience();
			const billingTimeFrame = planConstantObj.getBillingTimeFrame();

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

			const { annualPricePerMonth, isMonthlyPlan } = properties;

			return (
				<th scope="col" key={ planName } className={ classes }>
					<PlanFeaturesComparisonHeader
						audience={ audience }
						availableForPurchase={ availableForPurchase }
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
						rawPriceAnnual={ rawPriceAnnual }
						rawPriceForMonthlyPlan={ rawPriceForMonthlyPlan }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						selectedPlan={ selectedPlan }
						showPlanCreditsApplied={ true === showPlanCreditsApplied && ! this.hasDiscountNotice() }
						title={ planConstantObj.getTitle() }
						plansWithScroll={ withScroll }
						annualPricePerMonth={ annualPricePerMonth }
						isMonthlyPlan={ isMonthlyPlan }
					/>
				</th>
			);
		} );
	}

	handleUpgradeClick( singlePlanProperties ) {
		const { isInSignup, onUpgradeClick: ownPropsOnUpgradeClick, redirectTo } = this.props;

		const {
			availableForPurchase,
			cartItemForPlan,
			checkoutUrl,
			siteIsPrivateAndGoingAtomic,
		} = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && ownPropsOnUpgradeClick !== noop && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		if ( ! availableForPurchase ) {
			return;
		}

		const checkoutUrlWithArgs = addQueryArgs( { redirect_to: redirectTo }, checkoutUrl );

		if ( siteIsPrivateAndGoingAtomic ) {
			if ( isInSignup ) {
				// Let signup do its thing
				return;
			}
			page( checkoutUrlWithArgs );
			return;
		}

		page( checkoutUrlWithArgs );
	}

	renderTopButtons() {
		const {
			canPurchase,
			disableBloggerPlanWithNonBlogDomain,
			isInSignup,
			isLandingPage,
			isLaunchPage,
			planProperties,
			selectedPlan,
			selectedSiteSlug,
			purchaseId,
			translate,
		} = this.props;

		return map( planProperties, ( properties ) => {
			let { availableForPurchase } = properties;
			const {
				current,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;

			const classes = classNames(
				'plan-features-comparison__table-item',
				'has-border-bottom',
				'is-top-buttons'
			);

			let forceDisplayButton = false;
			let buttonText = null;

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					availableForPurchase = false;
					forceDisplayButton = true;
					buttonText = translate( 'Only with .blog domains' );
				}
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesComparisonActions
						availableForPurchase={ availableForPurchase }
						buttonText={ buttonText }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						forceDisplayButton={ forceDisplayButton }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
						manageHref={
							purchaseId
								? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
								: `/plans/my-plan/${ selectedSiteSlug }`
						}
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
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
				<tr key={ rowIndex } className="plan-features-comparison__row">
					{ this.renderPlanFeatureColumns( rowIndex ) }
				</tr>
			);
		} );
	}

	renderAnnualPlansFeatureNotice( feature ) {
		const { translate, isInSignup } = this.props;

		if (
			! isInSignup ||
			! feature.availableOnlyForAnnualPlans ||
			feature.availableForCurrentPlan
		) {
			return '';
		}

		return (
			<span className="plan-features-comparison__item-annual-plan">
				{ translate( 'Included with annual plans' ) }
			</span>
		);
	}

	renderFeatureItem( feature, index ) {
		const classes = classNames( 'plan-features-comparison__item-info', {
			'is-annual-plan-feature': feature.availableOnlyForAnnualPlans,
			'is-available': feature.availableForCurrentPlan,
		} );

		return (
			<>
				<PlanFeaturesAvailableItem
					key={ index }
					annualOnlyContent={ this.renderAnnualPlansFeatureNotice( feature ) }
				>
					<span className={ classes }>
						<span className="plan-features-comparison__item-title">
							{ feature.getTitle( this.props.domainName ) }
						</span>
					</span>
				</PlanFeaturesAvailableItem>
			</>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const { planProperties, selectedFeature, withScroll } = this.props;

		return map( planProperties, ( properties, mapIndex ) => {
			const { features, planName } = properties;
			const featureKeys = Object.keys( features );
			const key = featureKeys[ rowIndex ];
			const currentFeature = features[ key ];

			const classes = classNames(
				'plan-features-comparison__table-item',
				getPlanClass( planName ),
				{
					'has-partial-border': ! withScroll && rowIndex + 1 < featureKeys.length,
					'is-last-feature': rowIndex + 1 === featureKeys.length,
					'is-highlighted':
						selectedFeature && currentFeature && selectedFeature === currentFeature.getSlug(),
					'is-bold': rowIndex === 0,
				}
			);

			return currentFeature ? (
				<td key={ `${ planName }-${ key }` } className={ classes }>
					{ this.renderFeatureItem( currentFeature, mapIndex ) }
				</td>
			) : (
				<td key={ `${ planName }-none` } className="plan-features-comparison__table-item" />
			);
		} );
	}

	UNSAFE_componentWillMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}
}

PlanFeaturesComparison.propTypes = {
	basePlansPath: PropTypes.string,
	canPurchase: PropTypes.bool.isRequired,
	disableBloggerPlanWithNonBlogDomain: PropTypes.bool,
	displayJetpackPlans: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isJetpack: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	popularPlan: PropTypes.object,
	visiblePlans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	selectedSiteSlug: PropTypes.string,
	purchaseId: PropTypes.number,
	siteId: PropTypes.number,
	sitePlan: PropTypes.object,
};

PlanFeaturesComparison.defaultProps = {
	basePlansPath: null,
	displayJetpackPlans: false,
	isInSignup: false,
	isJetpack: false,
	selectedSiteSlug: '',
	siteId: null,
	onUpgradeClick: noop,
};

export const isPrimaryUpgradeByPlanDelta = ( currentPlan, plan ) =>
	( planMatches( currentPlan, { type: TYPE_BLOGGER, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_FREE, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_P2_PLUS, group: GROUP_WPCOM } ) );

export const calculatePlanCredits = ( state, siteId, planProperties ) =>
	planProperties
		.map( ( { planName, availableForPurchase } ) => {
			if ( ! availableForPurchase ) {
				return 0;
			}
			const annualDiscountPrice = getPlanDiscountedRawPrice( state, siteId, planName );
			const annualRawPrice = getSitePlanRawPrice( state, siteId, planName );
			if ( typeof annualDiscountPrice !== 'number' || typeof annualRawPrice !== 'number' ) {
				return 0;
			}

			return annualRawPrice - annualDiscountPrice;
		} )
		.reduce( ( max, credits ) => Math.max( max, credits ), 0 );

const hasPlaceholders = ( planProperties ) =>
	planProperties.filter( ( planProps ) => planProps.isPlaceholder ).length > 0;

/* eslint-disable wpcalypso/redux-no-bound-selectors */
export default connect(
	( state, ownProps ) => {
		const {
			isInSignup,
			placeholder,
			plans,
			isLandingPage,
			siteId,
			displayJetpackPlans,
			visiblePlans,
			popularPlanSpec,
			withDiscount,
		} = ownProps;
		const selectedSiteId = siteId;
		const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
		// If no site is selected, fall back to use the `displayJetpackPlans` prop's value
		const isJetpack = selectedSiteId ? isJetpackSite( state, selectedSiteId ) : displayJetpackPlans;
		const isSiteAT = selectedSiteId ? isSiteAutomatedTransfer( state, selectedSiteId ) : false;
		const siteIsPrivate = isPrivateSite( state, selectedSiteId );
		const sitePlan = getSitePlan( state, selectedSiteId );
		const sitePlans = getPlansBySiteId( state, selectedSiteId );
		const isPaid = isCurrentPlanPaid( state, selectedSiteId );
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;
		const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, selectedSiteId );

		let planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isLoadingSitePlans = selectedSiteId && ! sitePlans.hasLoadedFromServer;
				const showMonthly = ! isMonthly( plan );
				const availableForPurchase = isInSignup
					? true
					: canUpgradeToPlan( state, selectedSiteId, plan ) && canPurchase;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = popularPlanSpec && planMatches( plan, popularPlanSpec );
				const newPlan = isNew( plan ) && ! isPaid;
				const bestValue = isBestValue( plan ) && ! isPaid;
				const currentPlan = sitePlan && sitePlan.product_slug;
				const planPath = getPlanPath( plan ) || '';

				const checkoutUrlArgs = {};
				// Auto-apply the coupon code to the cart for WPCOM sites
				if ( ! displayJetpackPlans && withDiscount ) {
					checkoutUrlArgs.coupon = withDiscount;
				}
				const checkoutUrl = addQueryArgs(
					checkoutUrlArgs,
					`/checkout/${ selectedSiteSlug }/${ planPath }`
				);

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = ! isJetpack || isSiteAT || ( ! relatedMonthlyPlan && showMonthly );
				let features = planConstantObj.getPlanCompareFeatures( abtest );

				// TODO: remove this once Quick Start sessions have been removed from Business Plan
				if ( isWpComBusinessPlan( plan ) ) {
					features = features.filter( ( feature ) => feature !== FEATURE_BUSINESS_ONBOARDING );
				}

				let planFeatures = getPlanFeaturesObject( features );
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
							if ( planConstantObj.getSignupCompareAvailableFeatures ) {
								planFeatures = getPlanFeaturesObject(
									planConstantObj.getSignupCompareAvailableFeatures( currentPlan )
								);
							}
					}
				}

				if ( displayJetpackPlans ) {
					planFeatures = getPlanFeaturesObject( planConstantObj.getSignupFeatures( currentPlan ) );
				}
				const siteIsPrivateAndGoingAtomic = siteIsPrivate && isWpComEcommercePlan( plan );
				const isMonthlyObj = { isMonthly: showMonthlyPrice };
				const rawPrice = siteId
					? getSitePlanRawPrice( state, selectedSiteId, plan, isMonthlyObj )
					: getPlanRawPrice( state, planProductId, showMonthlyPrice );

				const discountPrice = siteId
					? getPlanDiscountedRawPrice( state, selectedSiteId, plan, isMonthlyObj )
					: getDiscountedRawPrice( state, planProductId, showMonthlyPrice );

				let annualPricePerMonth = rawPrice;
				const isMonthlyPlan = isMonthly( plan );
				if ( isMonthlyPlan ) {
					// Get annual price per month for comparison
					const yearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( plan ) );
					if ( yearlyPlan ) {
						annualPricePerMonth = siteId
							? getSitePlanRawPrice( state, selectedSiteId, plan, { isMonthly: true } )
							: getPlanRawPrice( state, yearlyPlan.product_id, true );
					}
				}

				let rawPriceForMonthlyPlan; // This is the per month price of a monthly plan. E.g. $14 for Premium monthly.
				if ( isInSignup && ! displayJetpackPlans ) {
					const monthlyPlanKey = findPlansKeys( {
						group: planConstantObj.group,
						term: TERM_MONTHLY,
						type: planConstantObj.type,
					} )[ 0 ];
					const monthlyPlanProductId = getPlanFromKey( monthlyPlanKey )?.getProductId();

					rawPriceForMonthlyPlan = siteId
						? getSitePlanRawPrice( state, selectedSiteId, plan, true )
						: getPlanRawPrice( state, monthlyPlanProductId, true );
				}

				const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.() || [];
				if ( annualPlansOnlyFeatures.length > 0 ) {
					planFeatures = planFeatures.map( ( feature ) => {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);

						return {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
						};
					} );
				}

				// Strip annual-only features out for the site's /plans page
				if ( ! isInSignup || isPlaceholder ) {
					planFeatures = planFeatures.filter(
						( { availableForCurrentPlan = true } ) => availableForCurrentPlan
					);
				}

				return {
					availableForPurchase,
					cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ),
					checkoutUrl,
					currencyCode: getCurrentUserCurrencyCode( state ),
					current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
					discountPrice,
					features: planFeatures,
					isLandingPage,
					isPlaceholder,
					planConstantObj,
					planName: plan,
					planObject: planObject,
					popular: popular,
					productSlug: get( planObject, 'product_slug' ),
					newPlan: newPlan,
					bestValue: bestValue,
					hideMonthly: false,
					primaryUpgrade:
						isPrimaryUpgradeByPlanDelta( currentPlan, plan ) ||
						popular ||
						newPlan ||
						bestValue ||
						plans.length === 1,
					rawPrice,
					rawPriceAnnual: getPlanRawPrice( state, planProductId, false ),
					rawPriceForMonthlyPlan,
					relatedMonthlyPlan,
					siteIsPrivateAndGoingAtomic,
					annualPricePerMonth,
					isMonthlyPlan,
				};
			} )
		);

		const planCredits = calculatePlanCredits( state, siteId, planProperties );

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		const isJetpackNotAtomic = isJetpack && ! isSiteAT;

		const purchaseId = getCurrentPlanPurchaseId( state, siteId );

		return {
			canPurchase,
			isJetpack,
			planProperties,
			selectedSiteSlug,
			purchaseId,
			siteIsPrivate,
			sitePlan,
			siteType,
			planCredits,
			hasPlaceholders: hasPlaceholders( planProperties ),
			showPlanCreditsApplied:
				sitePlan &&
				sitePlan.product_slug !== PLAN_FREE &&
				planCredits &&
				! isJetpackNotAtomic &&
				! isInSignup,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeaturesComparison ) );

/* eslint-enable wpcalypso/redux-no-bound-selectors */
