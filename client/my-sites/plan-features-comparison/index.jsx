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
	FEATURE_CUSTOM_DOMAIN,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { compact, get, map, reduce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import {
	getHighlightedFeatures,
	getPlanFeatureAccessor,
} from 'calypso/my-sites/plan-features-comparison/util';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
	getDiscountedRawPrice,
} from 'calypso/state/plans/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
} from 'calypso/state/sites/plans/selectors';
import PlanFeaturesComparisonActions from './actions';
import PlanFeaturesComparisonHeader from './header';
import { PlanFeaturesItem } from './item';
import './style.scss';

const noop = () => {};

export class PlanFeaturesComparison extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}

	render() {
		const { isInSignup, planProperties, translate, isFAQCondensedExperiment } = this.props;
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
									{ isFAQCondensedExperiment
										? this.renderPlanFeatureRowsTest()
										: this.renderPlanFeatureRows() }
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
				annualPricePerMonth,
				availableForPurchase,
				currencyCode,
				current,
				discountPrice,
				planConstantObj,
				planName,
				popular,
				relatedMonthlyPlan,
				isMonthlyPlan,
				isPlaceholder,
				hideMonthly,
				rawPrice,
				rawPriceAnnual,
				rawPriceForMonthlyPlan,
			} = properties;

			const classes = classNames( 'plan-features-comparison__table-item', {
				'has-border-top': ! isReskinned,
			} );
			const audience = planConstantObj.getAudience?.();
			const billingTimeFrame = planConstantObj.getBillingTimeFrame();

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
			const {
				availableForPurchase,
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

	renderPlanFeatureRowsTest() {
		return (
			<>
				<tr className="plan-features-comparison__row">
					{ this.renderPlanUniqueFeatureColumnsTest() }
				</tr>
				<tr className="plan-features-comparison__row">
					{ this.renderPlanCommonFeatureColumnsTest() }
				</tr>
			</>
		);
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
					'is-bold': rowIndex === 0 || currentFeature?.isHighlightedFeature,
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

	renderPlanFeatures( features, planName, mapIndex ) {
		const { selectedFeature } = this.props;

		return map( features, ( currentFeature, featureIndex ) => {
			const classes = classNames( '', getPlanClass( planName ), {
				'is-last-feature': featureIndex + 1 === features.length,
				'is-highlighted':
					selectedFeature && currentFeature && selectedFeature === currentFeature.getSlug(),
				'is-bold': currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN,
			} );

			if ( currentFeature.isUniqueFeature ) {
				return (
					<li key={ `${ currentFeature.getSlug() }-${ featureIndex }` } className={ classes }>
						{ this.renderFeatureItem( currentFeature, mapIndex ) }
					</li>
				);
			}

			return (
				<div key={ `${ currentFeature.getSlug() }-${ featureIndex }` } className={ classes }>
					{ this.renderFeatureItem( currentFeature, mapIndex ) }
				</div>
			);
		} );
	}

	renderPlanUniqueFeatureColumnsTest() {
		const { planProperties } = this.props;
		return map( planProperties, ( properties, mapIndex ) => {
			const { planName } = properties;
			const features = properties.features.filter( ( feature ) => feature.isUniqueFeature );

			return (
				<td
					key={ `${ planName }-unique-${ mapIndex }` }
					className="plan-features-comparison__table-item plan-features-comparison__unique-features"
				>
					<ul>{ this.renderPlanFeatures( features, planName, mapIndex ) }</ul>
				</td>
			);
		} );
	}

	renderPlanCommonFeatureColumnsTest() {
		const { planProperties } = this.props;
		let previousPlanName = 'Free';
		let currentPlanName = 'Free';

		return map( planProperties, ( properties, mapIndex ) => {
			const { planName, planObject } = properties;
			previousPlanName = currentPlanName;
			currentPlanName = planObject.product_name_short;
			const features = properties.features.filter( ( feature ) => ! feature.isUniqueFeature );
			const planFeatureTitle =
				mapIndex === 0
					? `Get basic features with ${ currentPlanName }:`
					: `Everything in ${ previousPlanName }, plus:`;

			return (
				<td key={ `${ planName }-${ mapIndex }` } className="plan-features-comparison__table-item">
					<div className="plan-features-comparison__item plan-features-comparison__common-title is-bold">
						{ planFeatureTitle }
					</div>
					{ this.renderPlanFeatures( features, planName, mapIndex ) }
				</td>
			);
		} );
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
			isFAQCondensedExperiment,
		} = ownProps;
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;
		const flowName = getCurrentFlowName( state );

		let planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isMonthlyPlan = isMonthly( plan );
				const showMonthly = ! isMonthlyPlan;
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

				const featureAccessor = getPlanFeatureAccessor( { flowName, plan: planConstantObj } );
				if ( featureAccessor ) {
					planFeatures = getPlanFeaturesObject( featureAccessor() );
				}

				if ( isFAQCondensedExperiment && planConstantObj.getCondensedExperimentFeatures ) {
					planFeatures = getPlanFeaturesObject( planConstantObj.getCondensedExperimentFeatures() );
				}

				const rawPrice = getPlanRawPrice( state, planProductId, showMonthlyPrice );
				const discountPrice = getDiscountedRawPrice( state, planProductId, showMonthlyPrice );

				let annualPricePerMonth = discountPrice || rawPrice;
				if ( isMonthlyPlan ) {
					// Get annual price per month for comparison
					const yearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( plan ) );
					if ( yearlyPlan ) {
						const yearlyPlanDiscount = getDiscountedRawPrice(
							state,
							yearlyPlan.product_id,
							showMonthlyPrice
						);
						annualPricePerMonth =
							yearlyPlanDiscount ||
							getPlanRawPrice( state, yearlyPlan.product_id, showMonthlyPrice );
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
				const planUniqueFeatures = planConstantObj.getCondensedExperimentUniqueFeatures?.() || [];
				if ( annualPlansOnlyFeatures.length > 0 ) {
					planFeatures = planFeatures.map( ( feature ) => {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);
						const isUniqueFeature = planUniqueFeatures.includes( feature.getSlug() );

						return {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
							isUniqueFeature,
						};
					} );
				}

				const highlightedFeatures = getHighlightedFeatures( flowName, planConstantObj );
				if ( highlightedFeatures.length ) {
					planFeatures = planFeatures.map( ( feature ) => {
						return {
							...feature,
							isHighlightedFeature: highlightedFeatures.includes( feature.getSlug() ),
						};
					} );
				}

				// Strip annual-only features out for the site's /plans page
				if ( ! isInSignup || isPlaceholder ) {
					planFeatures = planFeatures.filter(
						( { availableForCurrentPlan = true } ) => availableForCurrentPlan
					);
				}

				const rawPriceAnnual =
					null !== discountPrice
						? discountPrice * 12
						: getPlanRawPrice( state, planProductId, false );

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
					popular,
					productSlug: get( planObject, 'product_slug' ),
					hideMonthly: false,
					primaryUpgrade: popular || plans.length === 1,
					rawPrice,
					rawPriceAnnual,
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
