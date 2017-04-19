/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
import { isCurrentPlanPaid, isCurrentSitePlan, getSitePlan, getSiteSlug } from 'state/sites/selectors';
import { isCurrentUserCurrentPlanOwner, getPlansBySiteId } from 'state/sites/plans/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import {
	getPlanRawPrice,
	getPlan,
	getPlanSlug,
	getPlanBySlug
} from 'state/plans/selectors';
import {
	isPopular,
	isNew,
	isMonthly,
	getPlanFeaturesObject,
	getPlanClass,
	getMonthlyPlanByYearly,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
} from 'lib/plans/constants';
import { isFreePlan } from 'lib/plans';
import {
	getPlanPath,
	canUpgradeToPlan,
	applyTestFiltersToPlansList
} from 'lib/plans';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import Notice from 'components/notice';
import SpinnerLine from 'components/spinner-line';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent } from 'state/analytics/actions';
import { retargetViewPlans } from 'lib/analytics/ad-tracking';
import { abtest } from 'lib/abtest';

class PlanFeatures extends Component {

	render() {
		const { planProperties } = this.props;

		const tableClasses = classNames( 'plan-features__table',
			`has-${ planProperties.length }-cols` );

		return (
			<div>
				{ this.renderUpgradeDisabledNotice() }
				<div className="plan-features__content">
					<div className="plan-features__mobile">
						{ this.renderMobileView() }
					</div>
					<table className={ tableClasses }>
						<tbody>
							<tr>
								{ this.renderPlanHeaders() }
							</tr>
							<tr>
								{ this.renderPlanDescriptions() }
							</tr>
							<tr>
								{ this.renderTopButtons() }
							</tr>
								{ this.renderPlanFeatureRows() }
							<tr>
								{ this.renderBottomButtons() }
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	renderUpgradeDisabledNotice() {
		const { canPurchase, hasPlaceholders, translate } = this.props;

		if ( hasPlaceholders || canPurchase ) {
			return null;
		}

		return (
			<Notice
				className="plan-features__notice"
				showDismiss={ false }
				status="is-info">
				{ translate( 'You need to be the plan owner to manage this site.' ) }
			</Notice>
		);
	}

	renderMobileView() {
		const {
			canPurchase, translate, planProperties, isInSignup, isLandingPage, intervalType, site, basePlansPath
		} = this.props;

		// move any free plan to last place in mobile view
		let freePlanProperties;
		const reorderedPlans = planProperties.filter( ( properties ) => {
			if ( isFreePlan( properties.planName ) ) {
				freePlanProperties = properties;
				return false;
			}
			return true;
		} );

		if ( freePlanProperties ) {
			reorderedPlans.push( freePlanProperties );
		}

		return map( reorderedPlans, ( properties ) => {
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
				hideMonthly
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
						intervalType={ intervalType }
						site={ site }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
					/>
					<p className="plan-features__description">
						{ planConstantObj.getDescription( abtest ) }
					</p>
					<PlanFeaturesActions
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						primaryUpgrade={ primaryUpgrade }
						available = { available }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isPopular = { popular }
						planName ={ planConstantObj.getTitle() }
					/>
					<FoldableCard
						header={ translate( 'Show features' ) }
						clickableHeader
						compact>
						{ this.renderMobileFeatures( features ) }
					</FoldableCard>
				</div>
			);
		} );
	}

	renderMobileFeatures( features ) {
		return map( features, ( currentFeature, index ) => {
			return this.renderFeatureItem( currentFeature, index );
		} );
	}

	renderPlanHeaders() {
		const { planProperties, intervalType, site, basePlansPath } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				currencyCode,
				current,
				planConstantObj,
				planName,
				popular,
				newPlan,
				relatedMonthlyPlan,
				isPlaceholder,
				hideMonthly
			} = properties;
			const { rawPrice, discountPrice } = properties;
			const classes = classNames( 'plan-features__table-item', 'has-border-top' );

			return (
				<td key={ planName } className={ classes }>
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
						isPlaceholder={ isPlaceholder }
						intervalType={ intervalType }
						site={ site }
						hideMonthly={ hideMonthly }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
					/>
				</td>
			);
		} );
	}

	renderPlanDescriptions() {
		const { planProperties } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				planName,
				planConstantObj,
				isPlaceholder
			} = properties;

			const classes = classNames( 'plan-features__table-item', {
				'is-placeholder': isPlaceholder
			} );

			return (
				<td key={ planName } className={ classes }>
					{
						isPlaceholder
							? <SpinnerLine />
							: null
					}

					<p className="plan-features__description">
						{ planConstantObj.getDescription( abtest ) }
					</p>
				</td>
			);
		} );
	}

	renderTopButtons() {
		const { canPurchase, isLandingPage, planProperties, isInSignup, site } = this.props;

		return map( planProperties, ( properties ) => {
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
						available = { available }
						primaryUpgrade={ primaryUpgrade }
						planName ={ planConstantObj.getTitle() }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isPopular = { popular }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						manageHref={ `/plans/my-plan/${ site.slug }` }
					/>
				</td>
			);
		} );
	}

	getLongestFeaturesList() {
		const { planProperties } = this.props;

		return reduce( planProperties, ( longest, properties ) => {
			const currentFeatures = Object.keys( properties.features );
			return currentFeatures.length > longest.length
				? currentFeatures
				: longest;
		}, [] );
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
					? feature.getDescription( abtest )
					: null;
		return (
			<PlanFeaturesItem
				key={ index }
				description={ description }
				hideInfoPopover={ false }
			>
				<span className="plan-features__item-info">
					<span className="plan-features__item-title">{ feature.getTitle() }</span>
				</span>
			</PlanFeaturesItem>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const {
			planProperties,
			selectedFeature
		} = this.props;

		return map( planProperties, ( properties ) => {
			const {
				features,
				planName
			} = properties;

			const featureKeys = Object.keys( features ),
				key = featureKeys[ rowIndex ],
				currentFeature = features[ key ];

			const classes = classNames( 'plan-features__table-item', getPlanClass( planName ), {
				'has-partial-border': rowIndex + 1 < featureKeys.length,
				'is-highlighted': selectedFeature && currentFeature &&
					selectedFeature === currentFeature.getSlug()
			} );

			return (
				currentFeature
					? <td key={ `${ planName }-${ key }` } className={ classes }>
						{ this.renderFeatureItem( currentFeature ) }
					</td>
					: <td key={ `${ planName }-none` } className="plan-features__table-item"></td>
			);
		} );
	}

	renderBottomButtons() {
		const { canPurchase, planProperties, isInSignup, isLandingPage, site } = this.props;

		return map( planProperties, ( properties ) => {
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
						available = { available }
						primaryUpgrade={ primaryUpgrade }
						planName ={ planConstantObj.getTitle() }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isPopular = { popular }
						manageHref={ `/plans/my-plan/${ site.slug }` }
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
	canPurchase: PropTypes.bool.isRequired,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	planProperties: PropTypes.array,
	isInSignup: PropTypes.bool,
	basePlansPath: PropTypes.string,
	selectedFeature: PropTypes.string,
	intervalType: PropTypes.string,
	site: PropTypes.object
};

PlanFeatures.defaultProps = {
	onUpgradeClick: noop,
	isInSignup: false,
	basePlansPath: null,
	intervalType: 'yearly',
	site: {}
};

export default connect(
	( state, ownProps ) => {
		const { isInSignup, placeholder, plans, onUpgradeClick, isLandingPage, site } = ownProps;
		const selectedSiteId = site ? site.ID : null;
		const sitePlan = getSitePlan( state, selectedSiteId );
		const sitePlans = getPlansBySiteId( state, selectedSiteId );
		const isPaid = isCurrentPlanPaid( state, selectedSiteId );
		const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, selectedSiteId );
		const planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isLoadingSitePlans = selectedSiteId && ! sitePlans.hasLoadedFromServer;
				const showMonthly = ! isMonthly( plan );
				const available = isInSignup ? true : canUpgradeToPlan( plan, site ) && canPurchase;
				const relatedMonthlyPlan = showMonthly ? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) ) : null;
				const popular = isPopular( plan ) && ! isPaid;
				const newPlan = isNew( plan ) && ! isPaid;
				const currentPlan = sitePlan && sitePlan.product_slug;
				const showMonthlyPrice = ! relatedMonthlyPlan && showMonthly;

				if ( placeholder || ! planObject || isLoadingSitePlans ) {
					isPlaceholder = true;
				}
				return {
					isPlaceholder,
					isLandingPage,
					available: available,
					currencyCode: getCurrentUserCurrencyCode( state ),
					current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
					discountPrice: getPlanDiscountedRawPrice( state,
						selectedSiteId,
						plan,
						{
							isMonthly: showMonthly
						} ),
					features: getPlanFeaturesObject( planConstantObj.getFeatures( abtest ) ),
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
					hideMonthly: isInSignup && abtest( 'jetpackNoMonthly' ) === 'dontShowMonthly',
					primaryUpgrade: (
						( currentPlan === PLAN_PERSONAL && plan === PLAN_PREMIUM ) ||
						( currentPlan === PLAN_PREMIUM && plan === PLAN_BUSINESS ) ||
						popular,
						newPlan
					),
					rawPrice: getPlanRawPrice( state, planProductId, showMonthlyPrice ),
					relatedMonthlyPlan: relatedMonthlyPlan
				};
			} )
		);

		return {
			canPurchase,
			planProperties
		};
	},
	{
		recordTracksEvent
	}
)( localize( PlanFeatures ) );
