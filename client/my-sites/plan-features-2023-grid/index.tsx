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
	isBusinessPlan,
	isEcommercePlan,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	getPlanPath,
	PLAN_FREE,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';
import { last } from 'lodash';
import page from 'page';
import { Component, createRef } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import BloombergLogo from 'calypso/assets/images/onboarding/bloomberg-logo.svg';
import cloudLogo from 'calypso/assets/images/onboarding/cloud-logo.svg';
import CNNLogo from 'calypso/assets/images/onboarding/cnn-logo.svg';
import CondenastLogo from 'calypso/assets/images/onboarding/condenast-logo.svg';
import DisneyLogo from 'calypso/assets/images/onboarding/disney-logo.svg';
import FacebookLogo from 'calypso/assets/images/onboarding/facebook-logo.svg';
import SalesforceLogo from 'calypso/assets/images/onboarding/salesforce-logo.svg';
import SlackLogo from 'calypso/assets/images/onboarding/slack-logo.svg';
import TimeLogo from 'calypso/assets/images/onboarding/time-logo.svg';
import vipLogo from 'calypso/assets/images/onboarding/vip-logo.svg';
import wooLogo from 'calypso/assets/images/onboarding/woo-logo.svg';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import FoldableCard from 'calypso/components/foldable-card';
import JetpackLogo from 'calypso/components/jetpack-logo';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import PlanPill from 'calypso/components/plans/plan-pill';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { getDiscountByName } from 'calypso/lib/discounts';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { calculatePlanCredits } from 'calypso/my-sites/plan-features';
import { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/plan-type-selector';
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
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getCurrentPlan,
	isCurrentUserCurrentPlanOwner,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import {
	getSiteSlug,
	isCurrentPlanPaid,
	getSitePlan,
	isCurrentSitePlan,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import { getManagePurchaseUrlFor } from '../purchases/paths';
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridBillingTimeframe from './billing-timeframe';
import PlanFeatures2023GridFeatures from './features';
import PlanFeatures2023GridHeaderPrice from './header-price';
import { PlanFeaturesItem } from './item';
import { PlanComparisonGrid } from './plan-comparison-grid';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import { PlanProperties, TransformedFeatureObject } from './types';
import { getStorageStringFromFeature } from './util';

import './style.scss';

type PlanRowOptions = {
	isMobile?: boolean;
	previousProductNameShort?: string;
};

const Container = (
	props: (
		| React.HTMLAttributes< HTMLDivElement >
		| React.HTMLAttributes< HTMLTableCellElement >
	 ) & { isMobile?: boolean; scope?: string }
) => {
	const { children, isMobile, ...otherProps } = props;
	return isMobile ? (
		<div { ...otherProps }>{ children }</div>
	) : (
		<td { ...otherProps }>{ children }</td>
	);
};

type PlanFeatures2023GridProps = {
	isInSignup: boolean;
	siteId: number;
	isLaunchPage: boolean;
	isReskinned: boolean;
	is2023OnboardingPricingGrid: boolean;
	onUpgradeClick: ( cartItem: MinimalRequestCartProduct | null ) => void;
	// either you specify the plans prop or isPlaceholder prop
	plans: Array< string >;
	visiblePlans: Array< string >;
	flowName: string;
	domainName: string;
	placeholder?: string;
	isLandingPage?: boolean;
	intervalType: string;
	currentSitePlanSlug: string;
	withDiscount: boolean;
	discountEndDate: Date;
};

type PlanFeatures2023GridConnectedProps = {
	translate: LocalizeProps[ 'translate' ];
	recordTracksEvent: ( slug: string ) => void;
	planProperties: Array< PlanProperties >;
	canUserPurchasePlan: boolean;
	current: boolean;
	planTypeSelectorProps: PlanTypeSelectorProps;
	manageHref: string;
	selectedSiteSlug: string | null;
	planCredits: number;
	hasPlaceholders: boolean;
	showPlanCreditsApplied: boolean;
};

type PlanFeatures2023GridType = PlanFeatures2023GridProps &
	PlanFeatures2023GridConnectedProps & { children?: React.ReactNode };

type PlanFeatures2023GridState = {
	showPlansComparisonGrid: boolean;
};

type ServiceLogoProps = {
	imgSrc: string;
	imgAlt: string;
	hoverText: TranslateResult;
};

const ServiceLogo = ( props: ServiceLogoProps ) => (
	<div className="plan-features-2023-grid__plan-logo">
		<Plans2023Tooltip text={ props.hoverText }>
			<img src={ props.imgSrc } alt={ props.imgAlt } />{ ' ' }
		</Plans2023Tooltip>
	</div>
);

export class PlanFeatures2023Grid extends Component<
	PlanFeatures2023GridType,
	PlanFeatures2023GridState
> {
	state = {
		showPlansComparisonGrid: false,
	};

	plansComparisonGridContainerRef = createRef< HTMLDivElement >();

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}

	toggleShowPlansComparisonGrid = () => {
		this.setState( ( { showPlansComparisonGrid } ) => ( {
			showPlansComparisonGrid: ! showPlansComparisonGrid,
		} ) );
	};

	componentDidUpdate(
		prevProps: Readonly< PlanFeatures2023GridType >,
		prevState: Readonly< PlanFeatures2023GridState >
	) {
		// If the "Compare plans" button is clicked, scroll to the plans comparison grid.
		if (
			prevState.showPlansComparisonGrid === false &&
			this.plansComparisonGridContainerRef.current
		) {
			scrollIntoViewport( this.plansComparisonGridContainerRef.current, {
				behavior: 'smooth',
				scrollMode: 'if-needed',
			} );
		}
	}

	render() {
		const {
			isInSignup,
			planTypeSelectorProps,
			planProperties,
			intervalType,
			isLaunchPage,
			flowName,
			currentSitePlanSlug,
			manageHref,
			canUserPurchasePlan,
			translate,
			selectedSiteSlug,
		} = this.props;
		return (
			<div className="plans-wrapper">
				<QueryActivePromotions />
				{ this.renderNotice() }
				<div className="plan-features">
					<div className="plan-features-2023-grid__content">
						<div>
							<div className="plan-features-2023-grid__desktop-view">
								{ this.renderTable( planProperties ) }
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
				<div className="plan-features-2023-grid__toggle-plan-comparison-button-container">
					<Button onClick={ this.toggleShowPlansComparisonGrid }>
						{ this.state.showPlansComparisonGrid
							? translate( 'Hide comparison' )
							: translate( 'Compare plans' ) }
					</Button>
				</div>
				{ this.state.showPlansComparisonGrid ? (
					<div
						ref={ this.plansComparisonGridContainerRef }
						className="plan-features-2023-grid__plan-comparison-grid-container"
					>
						<PlanComparisonGrid
							planTypeSelectorProps={ planTypeSelectorProps }
							planProperties={ planProperties }
							intervalType={ intervalType }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							flowName={ flowName }
							currentSitePlanSlug={ currentSitePlanSlug }
							manageHref={ manageHref }
							canUserPurchasePlan={ canUserPurchasePlan }
							selectedSiteSlug={ selectedSiteSlug }
							onUpgradeClick={ this.handleUpgradeClick }
						/>
						<div className="plan-features-2023-grid__toggle-plan-comparison-button-container">
							<Button onClick={ this.toggleShowPlansComparisonGrid }>
								{ translate( 'Hide comparison' ) }
							</Button>
						</div>
					</div>
				) : null }
			</div>
		);
	}

	renderTable( planPropertiesObj: PlanProperties[] ) {
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
					<tr>{ this.renderPlanPrice( planPropertiesObj ) }</tr>
					<tr>{ this.renderBillingTimeframe( planPropertiesObj ) }</tr>
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
		const planPropertiesForTopRow = planProperties.filter( ( properties: PlanProperties ) =>
			topRowPlans.includes( properties.planConstantObj.type )
		);
		const planPropertiesForBottomRow = planProperties.filter( ( properties: PlanProperties ) =>
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
		const CardContainer = (
			props: React.ComponentProps< typeof FoldableCard > & { planName: string }
		) => {
			const { children, planName, ...otherProps } = props;
			return isWpcomEnterpriseGridPlan( planName ) ? (
				<div { ...otherProps }>{ children }</div>
			) : (
				<FoldableCard { ...otherProps } compact clickableHeader>
					{ children }
				</FoldableCard>
			);
		};
		let previousProductNameShort: string;

		return planProperties.map( ( properties: PlanProperties, index: number ) => {
			const planCardClasses = classNames(
				'plan-features-2023-grid__mobile-plan-card',
				getPlanClass( properties.planName )
			);
			const planCardJsx = (
				<div className={ planCardClasses } key={ `${ properties.planName }-${ index }` }>
					{ this.renderPlanLogos( [ properties ], { isMobile: true } ) }
					{ this.renderPlanHeaders( [ properties ], { isMobile: true } ) }
					{ this.renderPlanTagline( [ properties ], { isMobile: true } ) }
					{ this.renderPlanPrice( [ properties ], { isMobile: true } ) }
					{ this.renderBillingTimeframe( [ properties ], { isMobile: true } ) }
					{ this.renderMobileFreeDomain( properties.planName, properties.isMonthlyPlan ) }
					{ this.renderTopButtons( [ properties ], { isMobile: true } ) }
					<CardContainer
						header={ translate( 'Show all features' ) }
						planName={ properties.planName }
						key={ `${ properties.planName }-${ index }` }
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

	renderMobileFreeDomain( planName: string, isMonthlyPlan: boolean ) {
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

	renderPlanPrice( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { isReskinned, is2023OnboardingPricingGrid } = this.props;

		const isLargeCurrency = planPropertiesObj.some(
			( properties ) => properties?.rawPrice && properties?.rawPrice > 99000
		);

		return planPropertiesObj.map( ( properties ) => {
			const { currencyCode, discountPrice, planName, rawPrice } = properties;
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-bottom-aligned', {
				'has-border-top': ! isReskinned,
			} );
			const hasNoPrice = rawPrice === undefined || rawPrice === null;

			return (
				<Container
					scope="col"
					key={ planName }
					className={ classes }
					isMobile={ options?.isMobile }
				>
					{ ! hasNoPrice && (
						<PlanFeatures2023GridHeaderPrice
							currencyCode={ currencyCode }
							discountPrice={ discountPrice }
							rawPrice={ rawPrice }
							planName={ planName }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
						/>
					) }
				</Container>
			);
		} );
	}

	renderBillingTimeframe( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { translate } = this.props;
		return planPropertiesObj.map( ( properties ) => {
			const {
				planConstantObj,
				planName,
				rawPrice,
				rawPriceAnnual,
				currencyCode,
				annualPricePerMonth,
				isMonthlyPlan,
			} = properties;

			const classes = classNames(
				'plan-features-2023-grid__table-item',
				'plan-features-2023-grid__header-billing-info'
			);

			return (
				<Container className={ classes } isMobile={ options?.isMobile } key={ planName }>
					<PlanFeatures2023GridBillingTimeframe
						rawPrice={ rawPrice }
						rawPriceAnnual={ rawPriceAnnual }
						currencyCode={ currencyCode }
						annualPricePerMonth={ annualPricePerMonth }
						isMonthlyPlan={ isMonthlyPlan }
						planName={ planName }
						translate={ translate }
						billingTimeframe={ planConstantObj.getBillingTimeFrame() }
					/>
				</Container>
			);
		} );
	}

	renderPlanLogos( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { isInSignup, translate } = this.props;

		return planPropertiesObj.map( ( properties ) => {
			const { planName } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header-logo',
				getPlanClass( planName )
			);
			const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
				'popular-plan-parent-class': isBusinessPlan( planName ),
			} );

			return (
				<Container key={ planName } className={ tableItemClasses } isMobile={ options?.isMobile }>
					{ isBusinessPlan( planName ) && (
						<div className="plan-features-2023-grid__popular-badge">
							<PlanPill isInSignup={ isInSignup }>{ translate( 'Popular' ) }</PlanPill>
						</div>
					) }
					<header className={ headerClasses }>
						{ isBusinessPlan( planName ) && (
							<ServiceLogo
								hoverText={ translate(
									'WP Cloud gives you the tools you need to add scalable, highly available, extremely fast WordPress hosting.'
								) }
								imgSrc={ cloudLogo }
								imgAlt="WP Cloud logo"
							/>
						) }
						{ isEcommercePlan( planName ) && (
							<ServiceLogo
								hoverText={ translate(
									'Make your online store a reality with the power of WooCommerce.'
								) }
								imgSrc={ wooLogo }
								imgAlt="WooCommerce logo"
							/>
						) }
						{ isWpcomEnterpriseGridPlan( planName ) && (
							<ServiceLogo
								hoverText={ translate( 'The trusted choice for enterprise WordPress hosting.' ) }
								imgSrc={ vipLogo }
								imgAlt="WPVIP logo"
							/>
						) }
					</header>
				</Container>
			);
		} );
	}

	renderPlanHeaders( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		return planPropertiesObj.map( ( properties: PlanProperties ) => {
			const { planName, planConstantObj } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planName )
			);

			return (
				<Container
					key={ planName }
					className="plan-features-2023-grid__table-item"
					isMobile={ options?.isMobile }
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

	renderPlanTagline( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		return planPropertiesObj.map( ( properties ) => {
			const { planName, tagline } = properties;

			return (
				<Container
					key={ planName }
					className="plan-features-2023-grid__table-item"
					isMobile={ options?.isMobile }
				>
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
				</Container>
			);
		} );
	}

	handleUpgradeClick = ( singlePlanProperties: PlanProperties ) => {
		const { onUpgradeClick: ownPropsOnUpgradeClick, selectedSiteSlug } = this.props;
		const { cartItemForPlan, planName } = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planName ) ) {
			ownPropsOnUpgradeClick( null );
			return;
		}

		const planPath = getPlanPath( planName ) || '';
		const checkoutUrlWithArgs = `/checkout/${ selectedSiteSlug }/${ planPath }`;
		page( checkoutUrlWithArgs );
	};

	renderTopButtons( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const {
			isInSignup,
			isLaunchPage,
			flowName,
			canUserPurchasePlan,
			manageHref,
			currentSitePlanSlug,
			selectedSiteSlug,
		} = this.props;

		return planPropertiesObj.map( ( properties: PlanProperties ) => {
			const { planName, isPlaceholder, planConstantObj, current } = properties;
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

			return (
				<Container key={ planName } className={ classes } isMobile={ options?.isMobile }>
					<PlanFeatures2023GridActions
						manageHref={ manageHref }
						canUserPurchasePlan={ canUserPurchasePlan }
						availableForPurchase={ properties.availableForPurchase }
						className={ getPlanClass( planName ) }
						freePlan={ isFreePlan( planName ) }
						isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
						isPlaceholder={ isPlaceholder ?? false }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						flowName={ flowName }
						current={ current ?? false }
						currentSitePlanSlug={ currentSitePlanSlug }
						selectedSiteSlug={ selectedSiteSlug }
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
		planPropertiesObj: PlanProperties[],
		options?: PlanRowOptions
	) {
		const { translate } = this.props;
		let previousPlanShortNameFromProperties: string;

		return planPropertiesObj.map( ( properties: PlanProperties ) => {
			const { planName, product_name_short } = properties;
			const shouldShowFeatureTitle =
				! isWpComFreePlan( planName ) && ! isWpcomEnterpriseGridPlan( planName );
			const planShortName =
				options?.previousProductNameShort || previousPlanShortNameFromProperties;
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
				! options?.isMobile && isWpcomEnterpriseGridPlan( planName ) ? { rowSpan: '2' } : {};
			return (
				<Container
					key={ planName }
					isMobile={ options?.isMobile }
					className="plan-features-2023-grid__table-item"
					{ ...rowspanProp }
				>
					{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
					{ isWpcomEnterpriseGridPlan( planName ) && this.renderEnterpriseClientLogos() }
				</Container>
			);
		} );
	}

	renderPlanFeaturesList( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { domainName, translate } = this.props;
		const planProperties = planPropertiesObj.filter(
			( properties ) => ! isWpcomEnterpriseGridPlan( properties.planName )
		);

		return planProperties.map( ( properties, mapIndex ) => {
			const { planName, features, jpFeatures } = properties;
			return (
				<Container
					key={ `${ planName }-${ mapIndex }` }
					isMobile={ options?.isMobile }
					className="plan-features-2023-grid__table-item"
				>
					<PlanFeatures2023GridFeatures
						features={ features }
						planName={ planName }
						domainName={ domainName }
					/>
					{ jpFeatures.length !== 0 && (
						<div className="plan-features-2023-grid__jp-logo" key="jp-logo">
							<Plans2023Tooltip
								text={ translate(
									'Security, performance and growth tools made by the WordPress experts.'
								) }
							>
								<JetpackLogo size={ 16 } />
							</Plans2023Tooltip>
						</div>
					) }
					<PlanFeatures2023GridFeatures
						features={ jpFeatures }
						planName={ planName }
						domainName={ domainName }
					/>
				</Container>
			);
		} );
	}

	renderPlanStorageOptions( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { translate } = this.props;
		return planPropertiesObj.map( ( properties ) => {
			if ( options?.isMobile && isWpcomEnterpriseGridPlan( properties.planName ) ) {
				return null;
			}

			const { planName, storageOptions } = properties;
			const storageJSX = storageOptions.map( ( storageFeature: string ) => {
				if ( storageFeature.length <= 0 ) {
					return;
				}
				return (
					<div className="plan-features-2023-grid__storage-buttons" key={ planName }>
						{ getStorageStringFromFeature( storageFeature ) }
					</div>
				);
			} );

			return (
				<Container
					key={ planName }
					className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
					isMobile={ options?.isMobile }
				>
					{ storageOptions.length ? (
						<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
					) : null }
					{ storageJSX }
				</Container>
			);
		} );
	}

	getBannerContainer() {
		return document.querySelector( '.plans-features-main__notice' );
	}

	higherPlanAvailable() {
		const currentPlan = this.props.currentSitePlanSlug;
		const availablePlanProperties = this.props.planProperties.filter(
			( { planName } ) => planName !== PLAN_ENTERPRISE_GRID_WPCOM
		);
		const highestPlan = last( availablePlanProperties );

		return currentPlan !== highestPlan?.planName && highestPlan?.availableForPurchase;
	}

	hasDiscountNotice() {
		const { canUserPurchasePlan, hasPlaceholders, withDiscount } = this.props;
		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}

		const activeDiscount = getDiscountByName( withDiscount );
		if ( ! activeDiscount || hasPlaceholders || ! canUserPurchasePlan ) {
			return false;
		}

		return true;
	}

	renderNotice() {
		return (
			this.renderUpgradeDisabledNotice() ||
			this.renderDiscountNotice() ||
			this.renderCreditNotice() ||
			this.renderMarketingMessage()
		);
	}

	renderMarketingMessage() {
		const { siteId, hasPlaceholders, isInSignup } = this.props;

		if ( hasPlaceholders || isInSignup ) {
			return null;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return null;
		}

		return ReactDOM.createPortal( <MarketingMessage siteId={ siteId } />, bannerContainer );
	}

	renderDiscountNotice() {
		if ( ! this.hasDiscountNotice() ) {
			return false;
		}

		const bannerContainer = this.getBannerContainer();
		const activeDiscount = getDiscountByName( this.props.withDiscount );
		if ( ! bannerContainer || ! activeDiscount ) {
			return false;
		}
		return ReactDOM.createPortal(
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ false }
				icon="info-outline"
				status="is-success"
			>
				{ activeDiscount?.plansPageNoticeTextTitle && (
					<strong>
						{ activeDiscount?.plansPageNoticeTextTitle }
						<br />
					</strong>
				) }
				{ activeDiscount.plansPageNoticeText }
			</Notice>,
			bannerContainer
		);
	}

	renderUpgradeDisabledNotice() {
		const { canUserPurchasePlan, hasPlaceholders, translate } = this.props;

		if ( hasPlaceholders || canUserPurchasePlan ) {
			return null;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}
		return ReactDOM.createPortal(
			<Notice className="plan-features__notice" showDismiss={ false } status="is-info">
				{ translate(
					'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
				) }
			</Notice>,
			bannerContainer
		);
	}

	renderCreditNotice() {
		const {
			canUserPurchasePlan,
			showPlanCreditsApplied,
			hasPlaceholders,
			translate,
			planCredits,
			planProperties,
		} = this.props;
		const bannerContainer = this.getBannerContainer();
		const isShowPlanCreditsApplied = true === showPlanCreditsApplied && ! this.hasDiscountNotice();

		if (
			hasPlaceholders ||
			! canUserPurchasePlan ||
			! bannerContainer ||
			! isShowPlanCreditsApplied ||
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
							amountInCurrency: formatCurrency(
								planCredits,
								planProperties[ 0 ].currencyCode || ''
							),
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
}

/* eslint-disable wpcalypso/redux-no-bound-selectors */
const ConnectedPlanFeatures2023Grid = connect(
	( state, ownProps: PlanFeatures2023GridProps ) => {
		const { placeholder, plans, isLandingPage, visiblePlans, isInSignup, siteId } = ownProps;
		const canUserPurchasePlan =
			! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId );
		const purchaseId = getCurrentPlanPurchaseId( state, siteId );
		const selectedSiteSlug = getSiteSlug( state, siteId );
		const sitePlan = getSitePlan( state, siteId );
		const currentSitePlan = getCurrentPlan( state, siteId );

		const isJetpack = siteId ? isJetpackSite( state, siteId ) : false;
		const isSiteAT = siteId ? isSiteAutomatedTransfer( state, siteId ) : false;

		let planProperties: PlanProperties[] = plans.map( ( plan: string ) => {
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
			if ( placeholder || ( ! planObject && plan !== PLAN_ENTERPRISE_GRID_WPCOM ) ) {
				isPlaceholder = true;
			}

			const planFeatures = getPlanFeaturesObject(
				planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ?? []
			);
			const jetpackFeatures = getPlanFeaturesObject(
				planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? []
			);

			const rawPrice = getPlanRawPrice( state, planProductId, showMonthlyPrice );
			const isMonthlyObj = { isMonthly: showMonthlyPrice };

			const discountPrice = siteId
				? getPlanDiscountedRawPrice( state, siteId, plan, isMonthlyObj )
				: getDiscountedRawPrice( state, planProductId, showMonthlyPrice );

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
			const rawPriceForMonthlyPlan = getPlanRawPrice( state, monthlyPlanProductId ?? 0, true );
			const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.() || [];
			let planFeaturesTransformed: Array< TransformedFeatureObject > = [];
			let jetpackFeaturesTransformed: Array< TransformedFeatureObject > = [];
			if ( annualPlansOnlyFeatures.length > 0 ) {
				planFeaturesTransformed = planFeatures.map( ( feature ) => {
					const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes( feature.getSlug() );

					return {
						...feature,
						availableOnlyForAnnualPlans,
						availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
					};
				} );
			}

			jetpackFeaturesTransformed = jetpackFeatures.map( ( feature ) => {
				const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes( feature.getSlug() );

				return {
					...feature,
					availableOnlyForAnnualPlans,
					availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
				};
			} );

			// Strip annual-only features out for the site's /plans page
			if ( isPlaceholder ) {
				planFeaturesTransformed = planFeaturesTransformed.filter(
					( { availableForCurrentPlan = true } ) => availableForCurrentPlan
				);
			}

			const rawPriceAnnual =
				null !== discountPrice
					? discountPrice * 12
					: getPlanRawPrice( state, planProductId, false );

			const tagline = planConstantObj.getPlanTagline?.() ?? '';
			const product_name_short =
				isWpcomEnterpriseGridPlan( plan ) && planConstantObj.getPathSlug
					? planConstantObj.getPathSlug()
					: planObject?.product_name_short ?? '';
			const storageOptions =
				( planConstantObj.get2023PricingGridSignupStorageOptions &&
					planConstantObj.get2023PricingGridSignupStorageOptions() ) ||
				[];

			const availableForPurchase = isInSignup || isPlanAvailableForPurchase( state, siteId, plan );

			return {
				availableForPurchase,
				cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ?? '' ),
				currencyCode: getCurrentUserCurrencyCode( state ),
				current: isCurrentSitePlan( state, siteId, planProductId ) ?? false,
				discountPrice,
				features: planFeaturesTransformed,
				jpFeatures: jetpackFeaturesTransformed,
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
			planProperties = planProperties.filter(
				( p: PlanProperties ) => visiblePlans.indexOf( p?.planName ) !== -1
			);
		}

		const manageHref =
			purchaseId && selectedSiteSlug
				? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
				: `/plans/my-plan/${ siteId }`;

		const planCredits = calculatePlanCredits( state, siteId, planProperties );
		const hasPlaceholders = ( planProperties: Array< PlanProperties > ) =>
			planProperties.filter( ( planProps ) => planProps.isPlaceholder ).length > 0;

		const isJetpackNotAtomic = isJetpack && ! isSiteAT;

		return {
			currentSitePlanSlug: currentSitePlan?.productSlug,
			planProperties,
			canUserPurchasePlan,
			manageHref,
			selectedSiteSlug,
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
)( localize( PlanFeatures2023Grid ) );
/* eslint-enable wpcalypso/redux-no-bound-selectors */

const WrappedPlanFeatures2023Grid = ( props: PlanFeatures2023GridType ) => {
	if ( props.isInSignup ) {
		return <ConnectedPlanFeatures2023Grid { ...props } />;
	}

	return (
		<CalypsoShoppingCartProvider>
			<ConnectedPlanFeatures2023Grid { ...props } />
		</CalypsoShoppingCartProvider>
	);
};

export default WrappedPlanFeatures2023Grid;
