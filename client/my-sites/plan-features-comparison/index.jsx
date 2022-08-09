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
	FEATURE_BLANK,
	FEATURE_BASIC_DESIGN,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
} from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { compact, get, map, reduce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { useExperiment } from 'calypso/lib/explat';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
	getDiscountedRawPrice,
} from 'calypso/state/plans/selectors';
import { getProductCost } from 'calypso/state/products-list/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
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
				<QueryProductsList />
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
		const description = feature.getDescription
			? feature.getDescription( undefined, this.props.domainName )
			: null;

		const classes = classNames( 'plan-features-comparison__item-info', {
			'is-annual-plan-feature': feature.availableOnlyForAnnualPlans,
			'is-available': feature.availableForCurrentPlan,
		} );

		const hideInfoPopover = feature.hideInfoPopover || ! description;

		return (
			<>
				<PlanFeaturesItem
					key={ index }
					description={ description }
					hideInfoPopover={ hideInfoPopover }
					annualOnlyContent={ this.renderAnnualPlansFeatureNotice( feature ) }
					isFeatureAvailable={ feature.availableForCurrentPlan }
				>
					<span className={ classes }>
						<span className="plan-features-comparison__item-title">
							{ feature.getTitle( this.props.domainName || feature.meta ) }
						</span>
					</span>
				</PlanFeaturesItem>
			</>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const { planProperties, selectedFeature } = this.props;

		return map( planProperties, ( properties, mapIndex ) => {
			const { features, planName, currencyCode, productCustomDesignCost } = properties;
			const featureKeys = Object.keys( features );
			const key = featureKeys[ rowIndex ];
			let currentFeature = features[ key ];

			if ( currentFeature?.getSlug() === FEATURE_BLANK ) {
				currentFeature = null;
			}

			if ( currentFeature?.getSlug() === FEATURE_BASIC_DESIGN ) {
				currentFeature.meta = {
					price: productCustomDesignCost,
					currency: currencyCode,
				};
			}

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
const ConnectedPlanFeaturesComparison = connect(
	( state, ownProps ) => {
		const {
			isInSignup,
			isPlansPageQuickImprovements,
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
				const isMonthlyPlan = isMonthly( plan );
				const showMonthly = ! isMonthlyPlan;
				const availableForPurchase = true;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = popularPlanSpec && planMatches( plan, popularPlanSpec );

				const productCustomDesignCost = getProductCost( state, PRODUCT_WPCOM_CUSTOM_DESIGN ) / 12;
				const currencyCode = getCurrentUserCurrencyCode( state );

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = true;
				const features = isPlansPageQuickImprovements
					? planConstantObj.getPlanCompareFeaturesV2()
					: planConstantObj.getPlanCompareFeatures();

				let planFeatures = getPlanFeaturesObject( features );
				if ( placeholder || ! planObject ) {
					isPlaceholder = true;
				}

				if ( ! isPlansPageQuickImprovements && planConstantObj.getSignupCompareAvailableFeatures ) {
					planFeatures = getPlanFeaturesObject(
						planConstantObj.getSignupCompareAvailableFeatures()
					);
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
				if ( annualPlansOnlyFeatures.length > 0 ) {
					planFeatures = planFeatures.map( ( feature ) => {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);

						return {
							...feature,
							availableOnlyForAnnualPlans,
							hideInfoPopover: ! isPlansPageQuickImprovements,
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

				const rawPriceAnnual =
					null !== discountPrice
						? discountPrice * 12
						: getPlanRawPrice( state, planProductId, false );

				return {
					availableForPurchase,
					cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ),
					currencyCode,
					productCustomDesignCost,
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

export default function PlanFeaturesComparisonWrapper( props ) {
	const locale = useLocale();
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'pricing_packaging_plans_page_quick_improvements',
		{
			isEligible: [ 'en-gb', 'en' ].includes( locale ),
		}
	);

	if ( isLoadingExperimentAssignment ) {
		return null;
	}

	return (
		<ConnectedPlanFeaturesComparison
			{ ...props }
			isPlansPageQuickImprovements={ 'treatment' === experimentAssignment?.variationName }
		/>
	);
}

/* eslint-enable wpcalypso/redux-no-bound-selectors */
