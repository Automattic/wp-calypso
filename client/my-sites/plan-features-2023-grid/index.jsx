import {
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getPlanClass,
	isFreePlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isMonthly,
	TERM_MONTHLY,
	isPremiumPlan,
	isEcommercePlan,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import BloombergLogo from 'calypso/assets/images/onboarding/bloomberg-logo.svg';
import CNNLogo from 'calypso/assets/images/onboarding/cnn-logo.svg';
import CondenastLogo from 'calypso/assets/images/onboarding/condenast-logo.svg';
import DisneyLogo from 'calypso/assets/images/onboarding/disney-logo.svg';
import FacebookLogo from 'calypso/assets/images/onboarding/facebook-logo.svg';
import SalesforceLogo from 'calypso/assets/images/onboarding/salesforce-logo.svg';
import SlackLogo from 'calypso/assets/images/onboarding/slack-logo.svg';
import TimeLogo from 'calypso/assets/images/onboarding/time-logo.svg';
import vipLogo from 'calypso/assets/images/onboarding/vip-logo.svg';
import wooLogo from 'calypso/assets/images/onboarding/woo-logo.svg';
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
import { PlanFeaturesItem } from './item';
import { getStorageStringFromFeature } from './util';
import './style.scss';

const noop = () => {};

const Container = ( props ) => {
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
		const { translate } = this.props;
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
					<tr>{ this.renderPlanTagline( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanPriceGroup( planPropertiesObj ) }</tr>
					<tr>{ this.renderTopButtons( planPropertiesObj ) }</tr>
					<tr>{ this.renderPreviousFeaturesIncludedTitle( planPropertiesObj ) }</tr>
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
		const { planProperties, translate } = this.props;
		const CardContainer = ( props ) => {
			const { children, planName, ...otherProps } = props;
			return isWpcomEnterpriseGridPlan( planName ) ? (
				<div { ...otherProps }>{ children }</div>
			) : (
				<FoldableCard { ...otherProps }>{ children }</FoldableCard>
			);
		};
		let previousProductNameShort;

		return planProperties.map( ( properties, index ) => {
			const cardExpandedProp = index === 0 ? { expanded: true } : {};
			const planCardClasses = classNames(
				'plan-features-2023-grid__mobile-plan-card',
				getPlanClass( properties.planName )
			);
			const planCardJsx = (
				<div className={ planCardClasses }>
					{ this.renderPlanLogos( [ properties ], { isMobile: true } ) }
					{ this.renderPlanHeaders( [ properties ], { isMobile: true } ) }
					{ this.renderPlanTagline( [ properties ], { isMobile: true } ) }
					{ this.renderPlanPriceGroup( [ properties ], { isMobile: true } ) }
					{ this.renderMobileFreeDomain( properties.planName, properties.isMonthlyPlan ) }
					{ this.renderTopButtons( [ properties ], { isMobile: true } ) }
					<CardContainer
						header={ translate( 'Show all features' ) }
						planName={ properties.planName }
						clickableHeader
						compact
						{ ...cardExpandedProp }
					>
						{ this.renderPreviousFeaturesIncludedTitle( [ properties ], {
							isMobile: true,
							previousProductNameShort,
						} ) }
						{ this.renderPlanFeaturesList( [ properties ], { isMobile: true } ) }
						{ this.renderPlanStorageOptions( [ properties ], { isMobile: true } ) }
					</CardContainer>
				</div>
			);
			previousProductNameShort = properties.product_name_short;
			return planCardJsx;
		} );
	}

	renderMobileFreeDomain( planName, isMonthlyPlan ) {
		const { translate } = this.props;

		if ( isMonthlyPlan || isWpComFreePlan( planName ) || isWpcomEnterpriseGridPlan( planName ) ) {
			return null;
		}
		const { domainName } = this.props;

		const displayText = domainName
			? translate( '%(domainName)s is included', {
					args: { domainName },
			  } )
			: translate( 'Free domain for one year' );

		return (
			<div className="plan-features-2023-grid__highlighted-feature">
				<PlanFeaturesItem>
					<span className="plan-features-2023-grid__item-info is-annual-plan-feature is-available">
						<span className="plan-features-2023-grid__item-title is-bold">{ displayText }</span>
					</span>
				</PlanFeaturesItem>
			</div>
		);
	}

	renderPlanPriceGroup( planPropertiesObj, { isMobile } = {} ) {
		const { isReskinned, flowName, is2023OnboardingPricingGrid } = this.props;

		return planPropertiesObj.map( ( properties ) => {
			const {
				annualPricePerMonth,
				currencyCode,
				discountPrice,
				planConstantObj,
				planName,
				relatedMonthlyPlan,
				isMonthlyPlan,
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
				<Container scope="col" key={ planName } className={ classes } isMobile={ isMobile }>
					<PlanFeatures2023GridHeaderPrice
						billingTimeFrame={ billingTimeFrame }
						currencyCode={ currencyCode }
						discountPrice={ discountPrice }
						hideMonthly={ hideMonthly }
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
				</Container>
			);
		} );
	}

	renderPlanLogos( planPropertiesObj, { isMobile } = {} ) {
		const { isInSignup, translate } = this.props;

		return planPropertiesObj.map( ( properties ) => {
			const { planName } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header-logo',
				getPlanClass( planName )
			);
			const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
				'popular-plan-parent-class': isPremiumPlan( planName ),
			} );

			return (
				<Container key={ planName } className={ tableItemClasses } isMobile={ isMobile }>
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
								<img src={ vipLogo } alt="WPVIP logo" />{ ' ' }
							</div>
						) }
					</header>
				</Container>
			);
		} );
	}

	renderPlanHeaders( planPropertiesObj, { isMobile } = {} ) {
		return planPropertiesObj.map( ( properties ) => {
			const { planName, planConstantObj } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planName )
			);

			return (
				<Container
					key={ planName }
					className="plan-features-2023-grid__table-item"
					isMobile={ isMobile }
				>
					<header className={ headerClasses }>
						<h4 className="plan-features-2023-grid__header-title">
							{ planConstantObj.getTitle() }
						</h4>
					</header>
				</Container>
			);
		} );
	}

	renderPlanTagline( planPropertiesObj, { isMobile } = {} ) {
		return planPropertiesObj.map( ( properties ) => {
			const { planName, tagline } = properties;

			return (
				<Container
					key={ planName }
					className="plan-features-2023-grid__table-item"
					isMobile={ isMobile }
				>
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
				</Container>
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

		return planPropertiesObj.map( ( properties ) => {
			const { planName, isPlaceholder, planConstantObj } = properties;
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

			return (
				<Container key={ planName } className={ classes } isMobile={ isMobile }>
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
				</Container>
			);
		} );
	}

	renderEnterpriseClientLogos() {
		return (
			<div className="plan-features-2023-grid__item plan-features-2023-grid__enterprise-logo">
				<img src={ TimeLogo } alt="WordPress VIP client logo for TIME" loading="lazy" />
				<img src={ SlackLogo } alt="WordPress VIP client logo for Slack" loading="lazy" />
				<img src={ DisneyLogo } alt="WordPress VIP client logo for Disney" loading="lazy" />
				<img src={ CNNLogo } alt="WordPress VIP client logo for CNN" loading="lazy" />
				<img src={ SalesforceLogo } alt="WordPress VIP client logo for Salesforce" loading="lazy" />
				<img src={ FacebookLogo } alt="WordPress VIP client logo for Facebook" loading="lazy" />
				<img src={ CondenastLogo } alt="WordPress VIP client logo for Conde Nast" loading="lazy" />
				<img src={ BloombergLogo } alt="WordPress VIP client logo for Bloomberg" loading="lazy" />
			</div>
		);
	}

	renderPreviousFeaturesIncludedTitle(
		planPropertiesObj,
		{ isMobile, previousProductNameShort } = {}
	) {
		const { translate } = this.props;
		let previousPlanShortNameFromProperties;

		return planPropertiesObj.map( ( properties ) => {
			const { planName, product_name_short } = properties;
			const shouldShowFeatureTitle =
				! isWpComFreePlan( planName ) && ! isWpcomEnterpriseGridPlan( planName );
			const planShortName = previousProductNameShort || previousPlanShortNameFromProperties;
			previousPlanShortNameFromProperties = product_name_short;
			const title =
				planShortName &&
				translate( 'Everything in %(planShortName)s, plus:', {
					args: { planShortName },
				} );
			const classes = classNames(
				'plan-features-2023-grid__common-title',
				getPlanClass( planName )
			);
			const rowspanProp =
				! isMobile && isWpcomEnterpriseGridPlan( planName ) ? { rowspan: '2' } : {};
			return (
				<Container
					key={ planName }
					isMobile={ isMobile }
					className="plan-features-2023-grid__table-item"
					{ ...rowspanProp }
				>
					{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
					{ isWpcomEnterpriseGridPlan( planName ) && this.renderEnterpriseClientLogos() }
				</Container>
			);
		} );
	}

	renderPlanFeaturesList( planPropertiesObj, { isMobile, previousProductNameShort } = {} ) {
		const { domainName } = this.props;
		const planProperties = planPropertiesObj.filter(
			( properties ) => ! isWpcomEnterpriseGridPlan( properties.planName )
		);

		return (
			<PlanFeatures2023GridFeatures
				planProperties={ planProperties }
				domainName={ domainName }
				isMobile={ isMobile }
				previousProductNameShort={ previousProductNameShort }
				Container={ Container }
			/>
		);
	}

	renderPlanStorageOptions( planPropertiesObj, { isMobile } = {} ) {
		const { translate } = this.props;
		return planPropertiesObj.map( ( properties ) => {
			if ( isMobile && isWpcomEnterpriseGridPlan( properties.planName ) ) {
				return null;
			}

			const { planName, storageOptions } = properties;
			const storageJSX = storageOptions.map( ( storageFeature ) => {
				if ( storageFeature.length <= 0 ) {
					return;
				}
				return (
					<div className="plan-features-2023-grid__storage-buttons">
						{ getStorageStringFromFeature( storageFeature ) }
					</div>
				);
			} );

			return (
				<Container
					key={ planName }
					className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
					isMobile={ isMobile }
				>
					{ storageOptions.length ? (
						<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
					) : null }
					{ storageJSX }
				</Container>
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
	flowName: PropTypes.string,
};

PlanFeatures2023Grid.defaultProps = {
	isInSignup: true,
	onUpgradeClick: noop,
};

/* eslint-disable wpcalypso/redux-no-bound-selectors */
export default connect(
	( state, ownProps ) => {
		const { placeholder, plans, isLandingPage, visiblePlans } = ownProps;

		let planProperties = plans.map( ( plan ) => {
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
			if ( placeholder || ! planObject ) {
				isPlaceholder = true;
			}

			let planFeatures = getPlanFeaturesObject(
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
						yearlyPlanDiscount || getPlanRawPrice( state, yearlyPlan.product_id, showMonthlyPrice );
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
					const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes( feature.getSlug() );

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
			const product_name_short = isWpcomEnterpriseGridPlan( plan )
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
		} );

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p?.planName ) !== -1 );
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
