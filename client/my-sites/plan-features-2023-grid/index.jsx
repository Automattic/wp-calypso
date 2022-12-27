import {
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getPlanClass,
	isFreePlan,
	isWpcomEnterpriseGridPlan,
	isMonthly,
	TERM_MONTHLY,
	isPremiumPlan,
	isEcommercePlan,
	PLAN_ENTERPRISE_GRID_WPCOM,
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { compact, get, map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import vipLogo from 'calypso/assets/images/onboarding/vip-logo.svg';
import wooLogo from 'calypso/assets/images/onboarding/woo-logo.svg';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import FoldableCard from 'calypso/components/foldable-card';
import PlanPill from 'calypso/components/plans/plan-pill';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
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
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridFeatures from './features';
import PlanFeatures2023GridHeaderPrice from './header-price';
import './style.scss';

const noop = () => {};

const HeaderContainer = ( props ) => {
	const { children, isMobile, ...otherProps } = props;
	return isMobile ? (
		<div { ...otherProps }>{ children }</div>
	) : (
		<td { ...otherProps }>{ children }</td>
	);
};

export class PlanFeatures2023Grid extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}

	render() {
		const { isInSignup } = this.props;
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
					<div ref={ this.contentRef } className="plan-features-2023-grid__content">
						<div>
							<div className="plan-features-2023-grid__desktop-view">
								{ this.renderTable( this.props.planProperties ) }
							</div>
							<div className="plan-features-2023-grid__tablet-view">
								{ this.renderTabletView() }
							</div>
							<div className="plan-features-2023-grid__mobile-view">
								{ this.renderMobileView() }
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderTable( planPropertiesObj ) {
		const tableClasses = classNames(
			'plan-features-2023-grid__table',
			`has-${ planPropertiesObj.length }-cols`
		);

		return (
			<table className={ tableClasses }>
				<caption className="plan-features-2023-grid__screen-reader-text screen-reader-text">
					{ translate( 'Available plans to choose from' ) }
				</caption>
				<tbody>
					<tr>{ this.renderPlanLogos( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanHeaders( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanSubHeaders( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanPriceGroup( planPropertiesObj ) }</tr>
					<tr>{ this.renderTopButtons( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanFeaturesList( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanStorageOptions( planPropertiesObj ) }</tr>
				</tbody>
			</table>
		);
	}

	renderTabletView() {
		const { planProperties } = this.props;
		const topRowPlans = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
		const bottomRowPlans = [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
		const planPropertiesForTopRow = planProperties.filter( ( properties ) =>
			topRowPlans.includes( properties.planConstantObj.type )
		);
		const planPropertiesForBottomRow = planProperties.filter( ( properties ) =>
			bottomRowPlans.includes( properties.planConstantObj.type )
		);

		return (
			<>
				<div className="plan-features-2023-grid__table-top">
					{ this.renderTable( planPropertiesForTopRow ) }
				</div>
				<div className="plan-features-2023-grid__table-bottom">
					{ this.renderTable( planPropertiesForBottomRow ) }
				</div>
			</>
		);
	}

	renderMobileView() {
		const { planProperties } = this.props;

		return map( planProperties, ( properties ) => {
			const { planName, planConstantObj, tagline } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planName )
			);
			const propertiesContainerArray = [ properties ];

			return (
				<div className="plan-features-2023-grid__mobile-plan-card">
					<header className={ headerClasses }>
						<h4 className="plan-features-2023-grid__header-title">
							{ planConstantObj.getTitle() }
						</h4>
					</header>
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
					{ this.renderPlanPriceGroup( propertiesContainerArray, { isMobile: true } ) }
					{ this.renderTopButtons( propertiesContainerArray, { isMobile: true } ) }
					<FoldableCard header={ translate( 'Show features' ) } clickableHeader compact>
						{ this.renderPlanFeaturesList( propertiesContainerArray, { isMobile: true } ) }
					</FoldableCard>
				</div>
			);
		} );
	}

	renderPlanPriceGroup( planPropertiesObj, { isMobile } = {} ) {
		const { isReskinned, flowName, is2023OnboardingPricingGrid } = this.props;

		return map( planPropertiesObj, ( properties ) => {
			const {
				annualPricePerMonth,
				currencyCode,
				discountPrice,
				planConstantObj,
				planName,
				relatedMonthlyPlan,
				isMonthlyPlan,
				isPlaceholder,
				hideMonthly,
				rawPrice,
				rawPriceAnnual,
				rawPriceForMonthlyPlan,
			} = properties;

			const classes = classNames( 'plan-features-2023-grid__table-item', {
				'has-border-top': ! isReskinned,
			} );
			const billingTimeFrame = planConstantObj.getBillingTimeFrame();

			return (
				<HeaderContainer scope="col" key={ planName } className={ classes } isMobile={ isMobile }>
					<PlanFeatures2023GridHeaderPrice
						billingTimeFrame={ billingTimeFrame }
						currencyCode={ currencyCode }
						discountPrice={ discountPrice }
						hideMonthly={ hideMonthly }
						isPlaceholder={ isPlaceholder }
						rawPrice={ rawPrice }
						rawPriceAnnual={ rawPriceAnnual }
						rawPriceForMonthlyPlan={ rawPriceForMonthlyPlan }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						annualPricePerMonth={ annualPricePerMonth }
						isMonthlyPlan={ isMonthlyPlan }
						flow={ flowName }
						planName={ planName }
						is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					/>
				</HeaderContainer>
			);
		} );
	}

	renderPlanLogos( planPropertiesObj ) {
		const { isInSignup } = this.props;

		return map( planPropertiesObj, ( properties ) => {
			const { planName } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header-logo',
				getPlanClass( planName )
			);
			const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
				'popular-plan-parent-class': isPremiumPlan( planName ),
			} );

			return (
				<th scope="col" key={ planName } className={ tableItemClasses }>
					{ isPremiumPlan( planName ) && (
						<div className="plan-features-2023-grid__popular-badge">
							<PlanPill isInSignup={ isInSignup }>{ translate( 'Popular' ) }</PlanPill>
						</div>
					) }
					<header className={ headerClasses }>
						{ isEcommercePlan( planName ) && (
							<div className="plan-features-2023-grid__plan-logo">
								<img src={ wooLogo } alt="WooCommerce logo" />{ ' ' }
							</div>
						) }
						{ isWpcomEnterpriseGridPlan( planName ) && (
							<div className="plan-features-2023-grid__plan-logo">
								<img src={ vipLogo } alt="Enterprise logo" />{ ' ' }
							</div>
						) }
					</header>
				</th>
			);
		} );
	}

	renderPlanHeaders( planPropertiesObj ) {
		return map( planPropertiesObj, ( properties ) => {
			const { planName, planConstantObj } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planName )
			);

			return (
				<th scope="col" key={ planName } className="plan-features-2023-grid__table-item">
					<header className={ headerClasses }>
						<h4 className="plan-features-2023-grid__header-title">
							{ planConstantObj.getTitle() }
						</h4>
					</header>
				</th>
			);
		} );
	}

	renderPlanSubHeaders( planPropertiesObj ) {
		return map( planPropertiesObj, ( properties ) => {
			const { planName, tagline } = properties;

			return (
				<th scope="col" key={ planName } className="plan-features-2023-grid__table-item">
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
				</th>
			);
		} );
	}

	handleUpgradeClick( singlePlanProperties ) {
		const { onUpgradeClick: ownPropsOnUpgradeClick } = this.props;
		const { cartItemForPlan, planName } = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && ownPropsOnUpgradeClick !== noop && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planName ) ) {
			ownPropsOnUpgradeClick( null );
		}

		return `/checkout`;
	}

	renderTopButtons( planPropertiesObj, { isMobile } = {} ) {
		const { isInSignup, isLaunchPage, flowName } = this.props;

		return map( planPropertiesObj, ( properties ) => {
			const { planName, isPlaceholder, planConstantObj } = properties;
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

			return (
				<HeaderContainer key={ planName } className={ classes } isMobile={ isMobile }>
					<PlanFeatures2023GridActions
						className={ getPlanClass( planName ) }
						freePlan={ isFreePlan( planName ) }
						isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						flowName={ flowName }
					/>
				</HeaderContainer>
			);
		} );
	}

	renderPlanFeaturesList( planPropertiesObj, { isMobile } = {} ) {
		const { domainName } = this.props;

		return (
			<PlanFeatures2023GridFeatures
				planProperties={ planPropertiesObj }
				domainName={ domainName }
				isMobile={ isMobile }
			/>
		);
	}

	getFeatureToStorageMap( storageFeature ) {
		switch ( storageFeature ) {
			case FEATURE_1GB_STORAGE:
				return translate( '1GB' );
			case FEATURE_6GB_STORAGE:
				return translate( '6GB' );
			case FEATURE_13GB_STORAGE:
				return translate( '13GB' );
			case FEATURE_200GB_STORAGE:
				return translate( '200GB' );
			default:
				return null;
		}
	}

	renderPlanStorageOptions( planPropertiesObj ) {
		return planPropertiesObj.map( ( properties ) => {
			const { planName, storageOptions } = properties;
			const storageJSX = storageOptions.map( ( storageFeature ) => {
				if ( storageFeature.length <= 0 ) {
					return;
				}
				return (
					<div className="plan-features-2023-grid__storage-buttons">
						{ this.getFeatureToStorageMap( storageFeature ) }
					</div>
				);
			} );

			return (
				<th
					scope="col"
					key={ planName }
					className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
				>
					{ storageOptions.length ? (
						<div className="plan-features-2023-grid__storage-title">{ translate( 'STORAGE' ) }</div>
					) : null }
					{ storageJSX }
				</th>
			);
		} );
	}
}

PlanFeatures2023Grid.propTypes = {
	isInSignup: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	visiblePlans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	purchaseId: PropTypes.number,
	flowName: PropTypes.string,
	siteId: PropTypes.number,
};

PlanFeatures2023Grid.defaultProps = {
	isInSignup: true,
	siteId: null,
	onUpgradeClick: noop,
};

/* eslint-disable wpcalypso/redux-no-bound-selectors */
export default connect(
	( state, ownProps ) => {
		const { placeholder, plans, isLandingPage, visiblePlans } = ownProps;

		let planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isMonthlyPlan = isMonthly( plan );
				const showMonthly = ! isMonthlyPlan;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = true;

				const features = planConstantObj.getPlanCompareFeatures();

				let planFeatures = getPlanFeaturesObject( features );
				if ( placeholder || ! planObject ) {
					isPlaceholder = true;
				}

				planFeatures = getPlanFeaturesObject(
					planConstantObj.get2023PricingGridSignupWpcomFeatures()
				);
				let jetpackFeatures = getPlanFeaturesObject(
					planConstantObj.get2023PricingGridSignupJetpackFeatures()
				);

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
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
						};
					} );
				}

				jetpackFeatures = jetpackFeatures.map( ( feature ) => {
					const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes( feature.getSlug() );

					return {
						...feature,
						availableOnlyForAnnualPlans,
						availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
					};
				} );

				// Strip annual-only features out for the site's /plans page
				if ( isPlaceholder ) {
					planFeatures = planFeatures.filter(
						( { availableForCurrentPlan = true } ) => availableForCurrentPlan
					);
				}

				const rawPriceAnnual =
					null !== discountPrice
						? discountPrice * 12
						: getPlanRawPrice( state, planProductId, false );

				const tagline = planConstantObj.getPlanTagline();
				const product_name_short =
					PLAN_ENTERPRISE_GRID_WPCOM === plan
						? planConstantObj.getPathSlug()
						: planObject.product_name_short;
				const storageOptions = planConstantObj.get2023PricingGridSignupStorageOptions() || [];

				return {
					cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ),
					currencyCode: getCurrentUserCurrencyCode( state ),
					discountPrice,
					features: planFeatures,
					jpFeatures: jetpackFeatures,
					isLandingPage,
					isPlaceholder,
					planConstantObj,
					planName: plan,
					planObject: planObject,
					productSlug: get( planObject, 'product_slug' ),
					product_name_short,
					hideMonthly: false,
					rawPrice,
					rawPriceAnnual,
					rawPriceForMonthlyPlan,
					relatedMonthlyPlan,
					annualPricePerMonth,
					isMonthlyPlan,
					tagline,
					storageOptions,
				};
			} )
		);

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		return {
			planProperties,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeatures2023Grid ) );
/* eslint-enable wpcalypso/redux-no-bound-selectors */
