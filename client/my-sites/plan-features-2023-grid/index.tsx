import {
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getPlanClass,
	isFreePlan,
	isPersonalPlan,
	isEcommercePlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isMonthly,
	TERM_MONTHLY,
	isBusinessPlan,
	PLAN_ENTERPRISE_GRID_WPCOM,
	isPremiumPlan,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
	isWooExpressPlan,
	PlanSlug,
	isWooExpressPlusPlan,
} from '@automattic/calypso-products';
import {
	JetpackLogo,
	BloombergLogo,
	CloudLogo,
	CNNLogo,
	CondenastLogo,
	DisneyLogo,
	FacebookLogo,
	SalesforceLogo,
	SlackLogo,
	TimeLogo,
	VIPLogo,
	WooLogo,
} from '@automattic/components';
import { isAnyHostingFlow } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { localize, LocalizedComponent, LocalizeProps, useTranslate } from 'i18n-calypso';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import FoldableCard from 'calypso/components/foldable-card';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { FeatureObject, getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
import { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
} from 'calypso/state/plans/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSiteSlug, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import { getManagePurchaseUrlFor } from '../purchases/paths';
import PlanFeatures2023GridActions from './components/actions';
import PlanFeatures2023GridBillingTimeframe from './components/billing-timeframe';
import PlanFeatures2023GridFeatures from './components/features';
import PlanFeatures2023GridHeaderPrice from './components/header-price';
import { PlanFeaturesItem } from './components/item';
import { PlanComparisonGrid } from './components/plan-comparison-grid';
import { Plans2023Tooltip } from './components/plans-2023-tooltip';
import PopularBadge from './components/popular-badge';
import PlansGridContextProvider from './grid-context';
import useHighlightAdjacencyMatrix from './hooks/use-highlight-adjacency-matrix';
import useHighlightLabel from './hooks/use-highlight-label';
import useIsLargeCurrency from './hooks/use-is-large-currency';
import { PlanProperties, TransformedFeatureObject } from './types';
import { getStorageStringFromFeature } from './util';
import type { PlansIntent } from './grid-context';
import type { PlanActionOverrides } from './types';
import type { IAppState } from 'calypso/state/types';

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

export type PlanFeatures2023GridProps = {
	isInSignup?: boolean;
	siteId: number;
	isLaunchPage?: boolean | null;
	isReskinned: boolean;
	onUpgradeClick: ( cartItem: MinimalRequestCartProduct | null ) => void;
	// either you specify the plans prop or isPlaceholder prop
	plans: PlanSlug[];
	visiblePlans: Array< string >;
	flowName: string;
	domainName?: string;
	placeholder?: string;
	intervalType: string;
	currentSitePlanSlug?: string;
	hidePlansFeatureComparison: boolean;
	hideUnavailableFeatures: boolean;
	planActionOverrides?: PlanActionOverrides;
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	intent: PlansIntent;
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
	isPlanUpgradeCreditEligible: boolean;
};

type PlanFeatures2023GridType = PlanFeatures2023GridProps &
	PlanFeatures2023GridConnectedProps & { children?: React.ReactNode } & {
		isLargeCurrency: boolean;
	};

type PlanFeatures2023GridState = {
	showPlansComparisonGrid: boolean;
};

const PlanLogo: React.FunctionComponent< {
	planPropertiesObj: PlanProperties[];
	planIndex: number;
	planProperties: PlanProperties;
	isMobile?: boolean;
	isInSignup?: boolean;
	currentSitePlanSlug?: string;
	selectedPlan?: string;
} > = ( {
	planPropertiesObj,
	planProperties,
	planIndex,
	isMobile,
	isInSignup,
	currentSitePlanSlug,
	selectedPlan,
} ) => {
	const { planName, current } = planProperties;
	const translate = useTranslate();
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		visiblePlans: planPropertiesObj,
		currentSitePlanSlug,
		selectedPlan,
	} );
	const highlightLabel = useHighlightLabel( {
		planName,
		currentSitePlanSlug,
		selectedPlan,
	} );
	const headerClasses = classNames(
		'plan-features-2023-grid__header-logo',
		getPlanClass( planName )
	);
	const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
		'popular-plan-parent-class': highlightLabel,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planName ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planName ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planName ]?.isOnlyHighlight,
		'is-current-plan': current,
		'is-first-in-row': planIndex === 0,
		'is-last-in-row': planIndex === planPropertiesObj.length - 1,
	} );
	const popularBadgeClasses = classNames( {
		'with-plan-logo': ! (
			isFreePlan( planName ) ||
			isPersonalPlan( planName ) ||
			isPremiumPlan( planName )
		),
		'is-current-plan': current,
	} );

	const shouldShowWooLogo = isEcommercePlan( planName ) && ! isWooExpressPlan( planName );

	return (
		<Container key={ planName } className={ tableItemClasses } isMobile={ isMobile }>
			<PopularBadge
				isInSignup={ isInSignup }
				planName={ planName }
				additionalClassName={ popularBadgeClasses }
				currentSitePlanSlug={ currentSitePlanSlug }
				selectedPlan={ selectedPlan }
			/>
			<header className={ headerClasses }>
				{ isBusinessPlan( planName ) && (
					<Plans2023Tooltip
						text={ translate(
							'WP Cloud gives you the tools you need to add scalable, highly available, extremely fast WordPress hosting.'
						) }
					>
						<CloudLogo />
					</Plans2023Tooltip>
				) }
				{ shouldShowWooLogo && (
					<Plans2023Tooltip
						text={ translate( 'Make your online store a reality with the power of WooCommerce.' ) }
					>
						<WooLogo />
					</Plans2023Tooltip>
				) }
				{ isWpcomEnterpriseGridPlan( planName ) && (
					<Plans2023Tooltip
						text={ translate( 'The trusted choice for enterprise WordPress hosting.' ) }
					>
						<VIPLogo />
					</Plans2023Tooltip>
				) }
			</header>
		</Container>
	);
};

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
			hidePlansFeatureComparison,
			siteId,
			selectedPlan,
			selectedFeature,
			intent,
		} = this.props;
		return (
			<PlansGridContextProvider intent={ intent }>
				<div className="plans-wrapper">
					<QueryActivePromotions />
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
					{ ! hidePlansFeatureComparison && (
						<div className="plan-features-2023-grid__toggle-plan-comparison-button-container">
							<Button onClick={ this.toggleShowPlansComparisonGrid }>
								{ this.state.showPlansComparisonGrid
									? translate( 'Hide comparison' )
									: translate( 'Compare plans' ) }
							</Button>
						</div>
					) }
					{ ! hidePlansFeatureComparison && this.state.showPlansComparisonGrid ? (
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
								siteId={ siteId }
								selectedPlan={ selectedPlan }
								selectedFeature={ selectedFeature }
							/>
							<div className="plan-features-2023-grid__toggle-plan-comparison-button-container">
								<Button onClick={ this.toggleShowPlansComparisonGrid }>
									{ translate( 'Hide comparison' ) }
								</Button>
							</div>
						</div>
					) : null }
				</div>
			</PlansGridContextProvider>
		);
	}

	renderTable( planPropertiesObj: PlanProperties[] ) {
		const { translate } = this.props;
		const tableClasses = classNames(
			'plan-features-2023-grid__table',
			`has-${ planPropertiesObj.filter( ( { isVisible } ) => isVisible ).length }-cols`
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
					<tr>{ this.maybeRenderRefundNotice( planPropertiesObj ) }</tr>
					<tr>{ this.renderPreviousFeaturesIncludedTitle( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanFeaturesList( planPropertiesObj ) }</tr>
					<tr>{ this.renderPlanStorageOptions( planPropertiesObj ) }</tr>
				</tbody>
			</table>
		);
	}

	renderTabletView() {
		const { planProperties } = this.props;
		let plansToShow = [];

		plansToShow = planProperties
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties ) => properties.planName );

		const numberOfPlansToShowOnTop = 4 === plansToShow.length ? 2 : 3;
		const topRowPlans = plansToShow.slice( 0, numberOfPlansToShowOnTop );
		const bottomRowPlans = plansToShow.slice( numberOfPlansToShowOnTop, plansToShow.length );
		const planPropertiesForTopRow = planProperties.filter( ( properties: PlanProperties ) =>
			topRowPlans.includes( properties.planName )
		);
		const planPropertiesForBottomRow = planProperties.filter( ( properties: PlanProperties ) =>
			bottomRowPlans.includes( properties.planName )
		);

		return (
			<>
				<div className="plan-features-2023-grid__table-top">
					{ this.renderTable( planPropertiesForTopRow ) }
				</div>
				{ planPropertiesForBottomRow.length > 0 && (
					<div className="plan-features-2023-grid__table-bottom">
						{ this.renderTable( planPropertiesForBottomRow ) }
					</div>
				) }
			</>
		);
	}

	renderMobileView() {
		const { planProperties, translate, selectedFeature } = this.props;
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

		return planProperties
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties: PlanProperties, index: number ) => {
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
						{ this.maybeRenderRefundNotice( [ properties ], { isMobile: true } ) }
						<CardContainer
							header={ translate( 'Show all features' ) }
							planName={ properties.planName }
							key={ `${ properties.planName }-${ index }` }
							expanded={
								selectedFeature &&
								properties.features.some( ( feature ) => feature.getSlug() === selectedFeature )
							}
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
		const {
			isReskinned,
			isLargeCurrency,
			translate,
			isPlanUpgradeCreditEligible,
			currentSitePlanSlug,
			siteId,
		} = this.props;

		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties ) => {
				const { planName, rawPrice } = properties;
				const isWooExpressPlus = isWooExpressPlusPlan( planName );
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
								isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
								planProperties={ properties }
								isLargeCurrency={ isLargeCurrency }
								currentSitePlanSlug={ currentSitePlanSlug }
								siteId={ siteId }
							/>
						) }
						{ isWooExpressPlus && (
							<div className="plan-features-2023-grid__header-tagline">
								{ translate( 'Speak to our team for a custom quote.' ) }
							</div>
						) }
					</Container>
				);
			} );
	}

	renderBillingTimeframe( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { currentSitePlanSlug, siteId } = this.props;
		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties ) => {
				const { planConstantObj, planName, isMonthlyPlan, billingPeriod } = properties;

				const classes = classNames(
					'plan-features-2023-grid__table-item',
					'plan-features-2023-grid__header-billing-info'
				);

				return (
					<Container className={ classes } isMobile={ options?.isMobile } key={ planName }>
						<PlanFeatures2023GridBillingTimeframe
							isMonthlyPlan={ isMonthlyPlan }
							planName={ planName }
							billingTimeframe={ planConstantObj.getBillingTimeFrame() }
							billingPeriod={ billingPeriod }
							currentSitePlanSlug={ currentSitePlanSlug }
							siteId={ siteId }
						/>
					</Container>
				);
			} );
	}

	renderPlanLogos( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { isInSignup, currentSitePlanSlug, selectedPlan } = this.props;

		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties, index ) => {
				return (
					<PlanLogo
						key={ properties.planName }
						planIndex={ index }
						planPropertiesObj={ planPropertiesObj }
						planProperties={ properties }
						isMobile={ options?.isMobile }
						isInSignup={ isInSignup }
						currentSitePlanSlug={ currentSitePlanSlug }
						selectedPlan={ selectedPlan }
					/>
				);
			} );
	}

	renderPlanHeaders( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties: PlanProperties ) => {
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
		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties ) => {
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
		const { onUpgradeClick: ownPropsOnUpgradeClick } = this.props;
		const { cartItemForPlan, planName } = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planName ) ) {
			ownPropsOnUpgradeClick( null );
			return;
		}
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
			translate,
			planActionOverrides,
		} = this.props;

		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties: PlanProperties ) => {
				const { planName, isPlaceholder, planConstantObj, current } = properties;
				const classes = classNames(
					'plan-features-2023-grid__table-item',
					'is-top-buttons',
					'is-bottom-aligned'
				);

				// Leaving it `undefined` makes it use the default label
				let buttonText;

				if (
					isWooExpressMediumPlan( planName ) &&
					! isWooExpressMediumPlan( currentSitePlanSlug || '' )
				) {
					buttonText = translate( 'Get Performance', { textOnly: true } );
				} else if (
					isWooExpressSmallPlan( planName ) &&
					! isWooExpressSmallPlan( currentSitePlanSlug || '' )
				) {
					buttonText = translate( 'Get Essential', { textOnly: true } );
				}

				return (
					<Container key={ planName } className={ classes } isMobile={ options?.isMobile }>
						<PlanFeatures2023GridActions
							manageHref={ manageHref }
							canUserPurchasePlan={ canUserPurchasePlan }
							availableForPurchase={ properties.availableForPurchase }
							className={ getPlanClass( planName ) }
							freePlan={ isFreePlan( planName ) }
							isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
							isWooExpressPlusPlan={ isWooExpressPlusPlan( planName ) }
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
							buttonText={ buttonText }
							planActionOverrides={ planActionOverrides }
						/>
					</Container>
				);
			} );
	}

	maybeRenderRefundNotice( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { translate, flowName } = this.props;

		if ( ! isAnyHostingFlow( flowName ) ) {
			return false;
		}

		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( planProperties ) => (
				<Container
					key={ planProperties.planName }
					className="plan-features-2023-grid__table-item"
					isMobile={ options?.isMobile }
				>
					{ ! isFreePlan( planProperties.planName ) && (
						<div
							className={ `plan-features-2023-grid__refund-notice ${ getPlanClass(
								planProperties.planName
							) }` }
						>
							{ translate( 'Refundable within %(dayCount)s days. No questions asked.', {
								args: {
									dayCount: planProperties.billingPeriod === 365 ? 14 : 7,
								},
							} ) }
						</div>
					) }
				</Container>
			) );
	}

	renderEnterpriseClientLogos() {
		return (
			<div className="plan-features-2023-grid__item plan-features-2023-grid__enterprise-logo">
				<TimeLogo />
				<SlackLogo />
				<DisneyLogo />
				<CNNLogo />
				<SalesforceLogo />
				<FacebookLogo />
				<CondenastLogo />
				<BloombergLogo />
			</div>
		);
	}

	renderPreviousFeaturesIncludedTitle(
		planPropertiesObj: PlanProperties[],
		options?: PlanRowOptions
	) {
		const { translate } = this.props;
		let previousPlanShortNameFromProperties: string;

		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties: PlanProperties ) => {
				const { planName, product_name_short } = properties;
				const shouldRenderEnterpriseLogos =
					isWpcomEnterpriseGridPlan( planName ) || isWooExpressPlusPlan( planName );
				const shouldShowFeatureTitle =
					! isWpComFreePlan( planName ) && ! shouldRenderEnterpriseLogos;
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
					! options?.isMobile && shouldRenderEnterpriseLogos ? { rowSpan: '2' } : {};
				return (
					<Container
						key={ planName }
						isMobile={ options?.isMobile }
						className="plan-features-2023-grid__table-item"
						{ ...rowspanProp }
					>
						{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
						{ shouldRenderEnterpriseLogos && this.renderEnterpriseClientLogos() }
					</Container>
				);
			} );
	}

	renderPlanFeaturesList( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { domainName, translate, hideUnavailableFeatures, selectedFeature } = this.props;
		const planProperties = planPropertiesObj.filter(
			( properties ) =>
				! isWpcomEnterpriseGridPlan( properties.planName ) &&
				! isWooExpressPlusPlan( properties.planName )
		);

		return planProperties
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties, mapIndex ) => {
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
							hideUnavailableFeatures={ hideUnavailableFeatures }
							selectedFeature={ selectedFeature }
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
							hideUnavailableFeatures={ hideUnavailableFeatures }
						/>
					</Container>
				);
			} );
	}

	renderPlanStorageOptions( planPropertiesObj: PlanProperties[], options?: PlanRowOptions ) {
		const { translate } = this.props;
		return planPropertiesObj
			.filter( ( { isVisible } ) => isVisible )
			.map( ( properties ) => {
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
							<div className="plan-features-2023-grid__storage-title">
								{ translate( 'Storage' ) }
							</div>
						) : null }
						{ storageJSX }
					</Container>
				);
			} );
	}
}

const withIsLargeCurrency = ( Component: LocalizedComponent< typeof PlanFeatures2023Grid > ) => {
	return function ( props: PlanFeatures2023GridType ) {
		const isLargeCurrency = useIsLargeCurrency( {
			planSlugs: props.plans,
			siteId: props.siteId,
		} );
		return <Component { ...props } isLargeCurrency={ isLargeCurrency } />;
	};
};

/* eslint-disable wpcalypso/redux-no-bound-selectors */
const ConnectedPlanFeatures2023Grid = connect(
	( state: IAppState, ownProps: PlanFeatures2023GridProps ) => {
		const {
			placeholder,
			plans,
			visiblePlans,
			isInSignup,
			siteId,
			currentSitePlanSlug,
			selectedFeature,
			intent,
		} = ownProps;
		const canUserPurchasePlan =
			! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId );
		const purchaseId = getCurrentPlanPurchaseId( state, siteId );
		const selectedSiteSlug = getSiteSlug( state, siteId );

		const planProperties: PlanProperties[] = plans.map( ( plan: PlanSlug ) => {
			let isPlaceholder = false;
			const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
			const planProductId = planConstantObj.getProductId();
			const planObject = getPlan( state, planProductId );
			const billingPeriod = planObject?.bill_period;
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

			let planFeatures = [];
			let jetpackFeatures: FeatureObject[] = [];
			let tagline = '';

			if ( 'plans-newsletter' === intent ) {
				planFeatures = getPlanFeaturesObject(
					planConstantObj?.getNewsletterSignupFeatures?.() ?? []
				);
				tagline = planConstantObj.getNewsletterTagLine?.() ?? '';
			} else if ( 'plans-link-in-bio' === intent ) {
				planFeatures = getPlanFeaturesObject(
					planConstantObj?.getLinkInBioSignupFeatures?.() ?? []
				);
				tagline = planConstantObj.getLinkInBioTagLine?.() ?? '';
			} else if ( 'plans-blog-onboarding' === intent ) {
				planFeatures = getPlanFeaturesObject(
					planConstantObj?.getBlogOnboardingSignupFeatures?.() ?? []
				);

				jetpackFeatures = getPlanFeaturesObject(
					planConstantObj.getBlogOnboardingSignupJetpackFeatures?.() ?? []
				);
				tagline = planConstantObj.getBlogOnboardingTagLine?.() ?? '';
			} else {
				planFeatures = getPlanFeaturesObject(
					planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ?? []
				);

				jetpackFeatures = getPlanFeaturesObject(
					planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? []
				);
				tagline = planConstantObj.getPlanTagline?.() ?? '';
			}

			const rawPrice = getPlanRawPrice( state, planProductId, showMonthlyPrice );

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
			const topFeature = selectedFeature
				? planFeatures.find( ( feature ) => feature.getSlug() === selectedFeature )
				: undefined;

			if ( topFeature ) {
				const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
					topFeature.getSlug()
				);
				planFeaturesTransformed.unshift( {
					...topFeature,
					availableOnlyForAnnualPlans,
					availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
				} );
			}

			if ( annualPlansOnlyFeatures.length > 0 ) {
				planFeatures.forEach( ( feature ) => {
					if ( feature === topFeature ) {
						return;
					}

					const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes( feature.getSlug() );

					planFeaturesTransformed.push( {
						...feature,
						availableOnlyForAnnualPlans,
						availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
					} );
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

			const product_name_short =
				isWpcomEnterpriseGridPlan( plan ) && planConstantObj.getPathSlug
					? planConstantObj.getPathSlug()
					: planObject?.product_name_short ?? '';
			const storageOptions =
				( planConstantObj.get2023PricingGridSignupStorageOptions &&
					planConstantObj.get2023PricingGridSignupStorageOptions() ) ||
				[];
			const availableForPurchase = isInSignup || isPlanAvailableForPurchase( state, siteId, plan );
			const isCurrentPlan = currentSitePlanSlug === plan;
			const isVisible = visiblePlans?.indexOf( plan ) !== -1;

			return {
				availableForPurchase,
				cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ?? '' ),
				currencyCode: getCurrentUserCurrencyCode( state ),
				current: isCurrentPlan,
				features: planFeaturesTransformed,
				jpFeatures: jetpackFeaturesTransformed,
				isPlaceholder,
				isVisible,
				planConstantObj,
				planName: plan,
				planObject: planObject,
				product_name_short,
				hideMonthly: false,
				rawPrice,
				rawPriceForMonthlyPlan,
				relatedMonthlyPlan,
				isMonthlyPlan,
				tagline,
				storageOptions,
				billingPeriod,
				showMonthlyPrice,
			};
		} );

		const manageHref =
			purchaseId && selectedSiteSlug
				? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
				: `/plans/my-plan/${ siteId }`;

		return {
			currentSitePlanSlug,
			planProperties,
			canUserPurchasePlan,
			manageHref,
			selectedSiteSlug,
		};
	},
	{
		recordTracksEvent,
	}
)( withIsLargeCurrency( localize( PlanFeatures2023Grid ) ) );
/* eslint-enable wpcalypso/redux-no-bound-selectors */

const WrappedPlanFeatures2023Grid = ( props: PlanFeatures2023GridType ) => {
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible( props.siteId, props.plans );

	if ( props.isInSignup ) {
		return (
			<ConnectedPlanFeatures2023Grid
				{ ...props }
				isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
			/>
		);
	}

	return (
		<CalypsoShoppingCartProvider>
			<ConnectedPlanFeatures2023Grid
				{ ...props }
				isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
			/>
		</CalypsoShoppingCartProvider>
	);
};

export default WrappedPlanFeatures2023Grid;
