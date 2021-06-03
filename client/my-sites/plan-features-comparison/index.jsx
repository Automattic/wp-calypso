/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compact, get, map, reduce } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeaturesComparisonActions from './actions';
import PlanFeaturesComparisonHeader from './header';
import { PlanFeaturesItem } from './item';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
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
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import {
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getPlanClass,
	isFreePlan,
	isMonthly,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';

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

	renderPlanHeaders() {
		const { basePlansPath, planProperties, isReskinned } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				availableForPurchase,
				currencyCode,
				current,
				planConstantObj,
				planName,
				popular,
				relatedMonthlyPlan,
				isPlaceholder,
				hideMonthly,
				rawPrice,
				rawPriceAnnual,
				rawPriceForMonthlyPlan,
			} = properties;
			const { discountPrice } = properties;
			const classes = classNames( 'plan-features-comparison__table-item', {
				'has-border-top': ! isReskinned,
			} );
			const audience = planConstantObj.getAudience?.();
			const billingTimeFrame = planConstantObj.getBillingTimeFrame();
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
						isPlaceholder={ isPlaceholder }
						planType={ planName }
						popular={ popular }
						rawPrice={ rawPrice }
						rawPriceAnnual={ rawPriceAnnual }
						rawPriceForMonthlyPlan={ rawPriceForMonthlyPlan }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						title={ planConstantObj.getTitle() }
						annualPricePerMonth={ annualPricePerMonth }
						isMonthlyPlan={ isMonthlyPlan }
					/>
				</th>
			);
		} );
	}

	handleUpgradeClick( singlePlanProperties ) {
		const { onUpgradeClick: ownPropsOnUpgradeClick } = this.props;
		const { cartItemForPlan } = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && ownPropsOnUpgradeClick !== noop && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		return `/checkout`;
	}

	renderTopButtons() {
		const { isInSignup, isLaunchPage, planProperties } = this.props;

		return map( planProperties, ( properties ) => {
			const { availableForPurchase } = properties;
			const {
				current,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;

			const classes = classNames( 'plan-features-comparison__table-item', 'is-top-buttons' );

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesComparisonActions
						availableForPurchase={ availableForPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
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
				<PlanFeaturesItem
					key={ index }
					annualOnlyContent={ this.renderAnnualPlansFeatureNotice( feature ) }
					isFeatureAvailable={ feature.availableForCurrentPlan }
				>
					<span className={ classes }>
						<span className="plan-features-comparison__item-title">
							{ feature.getTitle( this.props.domainName ) }
						</span>
					</span>
				</PlanFeaturesItem>
			</>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const { planProperties, selectedFeature } = this.props;

		return map( planProperties, ( properties, mapIndex ) => {
			const { features, planName } = properties;
			const featureKeys = Object.keys( features );
			const key = featureKeys[ rowIndex ];
			const currentFeature = features[ key ];

			const classes = classNames(
				'plan-features-comparison__table-item',
				getPlanClass( planName ),
				{
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
	isInSignup: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	popularPlan: PropTypes.object,
	visiblePlans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	purchaseId: PropTypes.number,
	siteId: PropTypes.number,
};

PlanFeaturesComparison.defaultProps = {
	basePlansPath: null,
	isInSignup: true,
	siteId: null,
	onUpgradeClick: noop,
};

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
			visiblePlans,
			popularPlanSpec,
		} = ownProps;
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;

		let planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const showMonthly = ! isMonthly( plan );
				const availableForPurchase = true;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = popularPlanSpec && planMatches( plan, popularPlanSpec );

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = true;
				const features = planConstantObj.getPlanCompareFeatures();
				let planFeatures = getPlanFeaturesObject( features );
				if ( placeholder || ! planObject ) {
					isPlaceholder = true;
				}

				if ( planConstantObj.getSignupCompareAvailableFeatures ) {
					planFeatures = getPlanFeaturesObject(
						planConstantObj.getSignupCompareAvailableFeatures()
					);
				}

				const rawPrice = getPlanRawPrice( state, planProductId, showMonthlyPrice );
				const discountPrice = getDiscountedRawPrice( state, planProductId, showMonthlyPrice );

				let annualPricePerMonth = rawPrice;
				const isMonthlyPlan = isMonthly( plan );
				if ( isMonthlyPlan ) {
					// Get annual price per month for comparison
					const yearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( plan ) );
					if ( yearlyPlan ) {
						annualPricePerMonth = getPlanRawPrice( state, yearlyPlan.product_id, true );
					}
				}

				const monthlyPlanKey = findPlansKeys( {
					group: planConstantObj.group,
					term: TERM_MONTHLY,
					type: planConstantObj.type,
				} )[ 0 ];
				const monthlyPlanProductId = getPlanFromKey( monthlyPlanKey )?.getProductId();
				// This is the per month price of a monthly plan. E.g. $14 for Premium monthly.
				const rawPriceForMonthlyPlan = getPlanRawPrice( state, monthlyPlanProductId, true );
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
					currencyCode: getCurrentUserCurrencyCode( state ),
					discountPrice,
					features: planFeatures,
					isLandingPage,
					isPlaceholder,
					planConstantObj,
					planName: plan,
					planObject: planObject,
					popular: popular,
					productSlug: get( planObject, 'product_slug' ),
					hideMonthly: false,
					primaryUpgrade: popular || plans.length === 1,
					rawPrice,
					rawPriceAnnual: getPlanRawPrice( state, planProductId, false ),
					rawPriceForMonthlyPlan,
					relatedMonthlyPlan,
					annualPricePerMonth,
					isMonthlyPlan,
				};
			} )
		);

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		const purchaseId = getCurrentPlanPurchaseId( state, siteId );

		return {
			planProperties,
			purchaseId,
			siteType,
			hasPlaceholders: hasPlaceholders( planProperties ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeaturesComparison ) );

/* eslint-enable wpcalypso/redux-no-bound-selectors */
