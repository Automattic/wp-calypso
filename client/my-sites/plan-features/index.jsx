/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compact, get, findIndex, last, map, noop, reduce } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import Notice from 'components/notice';
import PlanFeaturesActions from './actions';
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import SpinnerLine from 'components/spinner-line';
import QueryActivePromotions from 'components/data/query-active-promotions';
import { abtest } from 'lib/abtest';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlan, getPlanBySlug, getPlanRawPrice, getPlanSlug } from 'state/plans/selectors';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';
import { retargetViewPlans } from 'lib/analytics/ad-tracking';
import canUpgradeToPlan from 'state/selectors/can-upgrade-to-plan';
import { getDiscountByName } from 'lib/discounts';
import { addQueryArgs } from 'lib/url';
import {
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getPlanPath,
	isFreePlan,
	getPlanClass,
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
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import {
	isBestValue,
	isMonthly,
	isNew,
	PLAN_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	GROUP_WPCOM,
} from 'lib/plans/constants';
import { getPlanFeaturesObject } from 'lib/plans/features-list';
import PlanFeaturesScroller from './scroller';

/**
 * Style dependencies
 */
import './style.scss';

export class PlanFeatures extends Component {
	render() {
		const { isInSignup, planProperties, plans, selectedPlan, withScroll } = this.props;
		const tableClasses = classNames(
			'plan-features__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', {
			'plan-features--signup': isInSignup,
		} );
		const planWrapperClasses = classNames( { 'plans-wrapper': isInSignup } );
		const mobileView = ! withScroll && (
			<div className="plan-features__mobile">{ this.renderMobileView() }</div>
		);
		let planDescriptions;
		let bottomButtons = null;

		if ( withScroll || ! isInSignup ) {
			planDescriptions = <tr>{ this.renderPlanDescriptions() }</tr>;

			bottomButtons = <tr>{ this.renderBottomButtons() }</tr>;
		}

		const initialSelectedIndex = selectedPlan
			? plans.indexOf( selectedPlan )
			: findIndex( planProperties, { popular: true } );

		return (
			<div className={ planWrapperClasses }>
				<QueryActivePromotions />
				<div className={ planClasses }>
					{ this.renderNotice() }
					<div ref={ this.contentRef } className="plan-features__content">
						{ mobileView }
						<PlanFeaturesScroller
							withScroll={ withScroll }
							planCount={ planProperties.length }
							cellSelector=".plan-features__table-item"
							initialSelectedIndex={ initialSelectedIndex }
						>
							<table className={ tableClasses }>
								<tbody>
									<tr>{ this.renderPlanHeaders() }</tr>
									{ ! withScroll && planDescriptions }
									<tr>{ this.renderTopButtons() }</tr>
									{ withScroll && planDescriptions }
									{ this.renderPlanFeatureRows() }
									{ ! withScroll && ! isInSignup && bottomButtons }
								</tbody>
							</table>
						</PlanFeaturesScroller>
					</div>
				</div>
			</div>
		);
	}

	renderNotice() {
		return (
			this.renderUpgradeDisabledNotice() || this.renderDiscountNotice() || this.renderCreditNotice()
		);
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
				className="plan-features__notice-credits"
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

	higherPlanAvailable() {
		const currentPlan = get( this.props, 'sitePlan.product_slug', '' );
		const highestPlan = last( this.props.planProperties );
		return currentPlan !== highestPlan.planName && highestPlan.availableForPurchase;
	}

	renderCreditNotice() {
		const {
			canPurchase,
			hasPlaceholders,
			translate,
			planCredits,
			planProperties,
			showPlanCreditsApplied,
		} = this.props;
		const bannerContainer = this.getBannerContainer();
		if (
			hasPlaceholders ||
			! canPurchase ||
			! bannerContainer ||
			! showPlanCreditsApplied ||
			! planCredits ||
			! this.higherPlanAvailable()
		) {
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
					'You have {{b}}%(amountInCurrency)s{{/b}} of pro-rated credits available from your current plan. ' +
						'Apply those credits towards an upgrade before they expire!',
					{
						args: {
							amountInCurrency: formatCurrency( planCredits, planProperties[ 0 ].currencyCode ),
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

	getBannerContainer() {
		return document.querySelector( '.plans-features-main__notice' );
	}

	renderUpgradeDisabledNotice() {
		const { canPurchase, hasPlaceholders, translate } = this.props;

		if ( hasPlaceholders || canPurchase ) {
			return null;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}
		return ReactDOM.createPortal(
			<Notice className="plan-features__notice" showDismiss={ false } status="is-info">
				{ translate( 'You need to be the plan owner to manage this site.' ) }
			</Notice>,
			bannerContainer
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
			showPlanCreditsApplied,
			isLaunchPage,
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
				availableForPurchase,
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
			} = properties;
			const { rawPrice, discountPrice } = properties;
			return (
				<div className="plan-features__mobile-plan" key={ planName }>
					<PlanFeaturesHeader
						availableForPurchase={ availableForPurchase }
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
						billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
						hideMonthly={ hideMonthly }
						isPlaceholder={ isPlaceholder }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						isInSignup={ isInSignup }
						selectedPlan={ selectedPlan }
						showPlanCreditsApplied={ true === showPlanCreditsApplied && ! this.hasDiscountNotice() }
					/>
					<p className="plan-features__description">{ planConstantObj.getDescription( abtest ) }</p>
					<PlanFeaturesActions
						availableForPurchase={ availableForPurchase }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
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
			disableBloggerPlanWithNonBlogDomain,
			displayJetpackPlans,
			isInSignup,
			isJetpack,
			planProperties,
			selectedPlan,
			siteType,
			showPlanCreditsApplied,
			withScroll,
		} = this.props;

		return map( planProperties, properties => {
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
			} = properties;
			let { discountPrice } = properties;
			const classes = classNames( 'plan-features__table-item', 'has-border-top' );
			let audience = planConstantObj.getAudience();
			let billingTimeFrame = planConstantObj.getBillingTimeFrame();

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					discountPrice = 0;
				}
			}

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
						relatedMonthlyPlan={ relatedMonthlyPlan }
						selectedPlan={ selectedPlan }
						showPlanCreditsApplied={ true === showPlanCreditsApplied && ! this.hasDiscountNotice() }
						title={ planConstantObj.getTitle() }
						plansWithScroll={ withScroll }
					/>
				</td>
			);
		} );
	}

	renderPlanDescriptions() {
		const { planProperties, withScroll } = this.props;

		return map( planProperties, properties => {
			const { planName, planConstantObj, isPlaceholder } = properties;

			const classes = classNames( 'plan-features__table-item', {
				'is-placeholder': isPlaceholder,
				'is-description': withScroll,
			} );

			let description = null;
			if ( withScroll ) {
				description = planConstantObj.getShortDescription( abtest );
			} else {
				description = planConstantObj.getDescription( abtest );
			}

			return (
				<td key={ planName } className={ classes }>
					{ isPlaceholder ? <SpinnerLine /> : null }

					<p className="plan-features__description">{ description }</p>
				</td>
			);
		} );
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
			translate,
		} = this.props;

		return map( planProperties, properties => {
			let { availableForPurchase } = properties;
			const {
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

			let forceDisplayButton = false,
				buttonText = null;

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					availableForPurchase = false;
					forceDisplayButton = true;
					buttonText = translate( 'Only with .blog domains' );
				}
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
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
				hideGridicon={ this.props.withScroll }
			>
				<span className="plan-features__item-info">
					<span className="plan-features__item-title">{ feature.getTitle() }</span>
				</span>
			</PlanFeaturesItem>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const { planProperties, selectedFeature, withScroll } = this.props;

		return map( planProperties, properties => {
			const { features, planName } = properties;

			const featureKeys = Object.keys( features ),
				key = featureKeys[ rowIndex ],
				currentFeature = features[ key ];

			const classes = classNames( 'plan-features__table-item', getPlanClass( planName ), {
				'has-partial-border': ! withScroll && rowIndex + 1 < featureKeys.length,
				'is-last-feature': rowIndex + 1 === featureKeys.length,
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
			disableBloggerPlanWithNonBlogDomain,
			isInSignup,
			isLandingPage,
			isLaunchPage,
			planProperties,
			selectedPlan,
			selectedSiteSlug,
		} = this.props;

		return map( planProperties, properties => {
			let { availableForPurchase } = properties;
			const {
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

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					availableForPurchase = false;
				}
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						availableForPurchase={ availableForPurchase }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
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

	UNSAFE_componentWillMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}
}

PlanFeatures.propTypes = {
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
	siteId: PropTypes.number,
	sitePlan: PropTypes.object,
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

export const isPrimaryUpgradeByPlanDelta = ( currentPlan, plan ) =>
	( planMatches( currentPlan, { type: TYPE_BLOGGER, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) );

export const calculatePlanCredits = ( state, siteId, planProperties ) =>
	planProperties
		.map( ( { planName, planConstantObj, availableForPurchase } ) => {
			if ( ! availableForPurchase ) {
				return 0;
			}
			const planProductId = planConstantObj.getProductId();
			const annualDiscountPrice = getPlanDiscountedRawPrice( state, siteId, planName, {
				isMonthly: false,
			} );
			const annualRawPrice = getPlanRawPrice( state, planProductId, false );

			if ( typeof annualDiscountPrice !== 'number' || typeof annualDiscountPrice !== 'number' ) {
				return 0;
			}

			return annualRawPrice - annualDiscountPrice;
		} )
		.reduce( ( max, credits ) => Math.max( max, credits ), 0 );

const hasPlaceholders = planProperties =>
	planProperties.filter( planProps => planProps.isPlaceholder ).length > 0;

/* eslint-disable wpcalypso/redux-no-bound-selectors */
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
			visiblePlans,
			popularPlanSpec,
			withDiscount,
		} = ownProps;
		const selectedSiteId = siteId;
		const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
		// If no site is selected, fall back to use the `displayJetpackPlans` prop's value
		const isJetpack = selectedSiteId ? isJetpackSite( state, selectedSiteId ) : displayJetpackPlans;
		const isSiteAT = selectedSiteId ? isSiteAutomatedTransfer( state, selectedSiteId ) : false;
		const sitePlan = getSitePlan( state, selectedSiteId );
		const sitePlans = getPlansBySiteId( state, selectedSiteId );
		const isPaid = isCurrentPlanPaid( state, selectedSiteId );
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;
		const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, selectedSiteId );

		let planProperties = compact(
			map( plans, plan => {
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

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = ! isJetpack || isSiteAT || ( ! relatedMonthlyPlan && showMonthly );

				let planFeatures = getPlanFeaturesObject(
					planConstantObj.getPlanCompareFeatures( abtest )
				);

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
					availableForPurchase,
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
								if ( ! availableForPurchase ) {
									return;
								}

								const args = {};
								// Auto-apply the coupon code to the cart for WPCOM sites
								if ( ! displayJetpackPlans && withDiscount ) {
									args.coupon = withDiscount;
								}

								page(
									addQueryArgs(
										args,
										`/checkout/${ selectedSiteSlug }/${ getPlanPath( plan ) || '' }`
									)
								);
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

		const planCredits = calculatePlanCredits( state, siteId, planProperties );

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( p => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		return {
			canPurchase,
			isJetpack,
			planProperties,
			selectedSiteSlug,
			sitePlan,
			siteType,
			planCredits,
			hasPlaceholders: hasPlaceholders( planProperties ),
			showPlanCreditsApplied:
				sitePlan &&
				sitePlan.product_slug !== PLAN_FREE &&
				planCredits &&
				! isJetpack &&
				! isInSignup,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeatures ) );

/* eslint-enable wpcalypso/redux-no-bound-selectors */
