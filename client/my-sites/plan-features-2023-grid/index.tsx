import {
	getPlanClass,
	isFreePlan,
	isPersonalPlan,
	isEcommercePlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isBusinessPlan,
	isPremiumPlan,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
	isWooExpressPlan,
	PlanSlug,
	isWooExpressPlusPlan,
	WPComStorageAddOnSlug,
	FeatureList,
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
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
import { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
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
import { StickyContainer } from './components/sticky-container';
import StorageAddOnDropdown from './components/storage-add-on-dropdown';
import PlansGridContextProvider, { usePlansGridContext } from './grid-context';
import useHighlightAdjacencyMatrix from './hooks/npm-ready/use-highlight-adjacency-matrix';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import { DataResponse } from './types';
import { getStorageStringFromFeature } from './util';
import type { PlansIntent } from './grid-context';
import type {
	GridPlan,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { PlanActionOverrides } from './types';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { IAppState } from 'calypso/state/types';
import './style.scss';

type PlanRowOptions = {
	isTableCell?: boolean;
	isStuck?: boolean;
};

export type PlanSelectedStorage = { [ key: string ]: WPComStorageAddOnSlug | null };

const Container = (
	props: (
		| React.HTMLAttributes< HTMLDivElement >
		| React.HTMLAttributes< HTMLTableCellElement >
	 ) & { isTableCell?: boolean; scope?: string }
) => {
	const { children, isTableCell, ...otherProps } = props;
	return isTableCell ? (
		<td { ...otherProps }>{ children }</td>
	) : (
		<div { ...otherProps }>{ children }</div>
	);
};

export type PlanFeatures2023GridProps = {
	gridPlansForFeaturesGrid: GridPlan[];
	gridPlansForComparisonGrid: GridPlan[]; // We need all the plans in order to show the correct features in the plan comparison table
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList: FeatureList;
	isInSignup?: boolean;
	siteId?: number | null;
	isLaunchPage?: boolean | null;
	isReskinned?: boolean;
	onUpgradeClick?: ( cartItem?: MinimalRequestCartProduct | null ) => void;
	flowName?: string | null;
	paidDomainName?: string;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	intervalType?: string;
	currentSitePlanSlug?: string | null;
	hidePlansFeatureComparison?: boolean;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	planActionOverrides?: PlanActionOverrides;
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	intent?: PlansIntent;
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >; // indicate when a custom domain is allowed to be used with the Free plan.
	isGlobalStylesOnPersonal?: boolean;
	showLegacyStorageFeature?: boolean;
	spotlightPlanSlug?: PlanSlug;
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
};

type PlanFeatures2023GridConnectedProps = {
	translate: LocalizeProps[ 'translate' ];
	recordTracksEvent: ( slug: string ) => void;
	canUserPurchasePlan: boolean | null;
	planTypeSelectorProps: PlanTypeSelectorProps;
	manageHref: string;
	selectedSiteSlug: string | null;
	isPlanUpgradeCreditEligible: boolean;
	isGlobalStylesOnPersonal?: boolean;
};

type PlanFeatures2023GridType = PlanFeatures2023GridProps &
	PlanFeatures2023GridConnectedProps & { children?: React.ReactNode } & {
		isLargeCurrency: boolean;
	};

type PlanFeatures2023GridState = {
	showPlansComparisonGrid: boolean;
	selectedStorage: PlanSelectedStorage;
};

const PlanLogo: React.FunctionComponent< {
	planIndex: number;
	planSlug: PlanSlug;
	renderedGridPlans: GridPlan[];
	isTableCell?: boolean;
	isInSignup?: boolean;
} > = ( { planIndex, planSlug, renderedGridPlans, isTableCell, isInSignup } ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const { current } = gridPlansIndex[ planSlug ];
	const translate = useTranslate();
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		renderedPlans: renderedGridPlans.map( ( gridPlan ) => gridPlan.planSlug ),
	} );
	const headerClasses = classNames(
		'plan-features-2023-grid__header-logo',
		getPlanClass( planSlug )
	);
	const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
		'popular-plan-parent-class': gridPlansIndex[ planSlug ]?.highlightLabel,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planSlug ]?.isOnlyHighlight,
		'is-current-plan': current,
		'is-first-in-row': planIndex === 0,
		'is-last-in-row': planIndex === renderedGridPlans.length - 1,
	} );
	const popularBadgeClasses = classNames( {
		'with-plan-logo': ! (
			isFreePlan( planSlug ) ||
			isPersonalPlan( planSlug ) ||
			isPremiumPlan( planSlug )
		),
		'is-current-plan': current,
	} );

	const shouldShowWooLogo = isEcommercePlan( planSlug ) && ! isWooExpressPlan( planSlug );

	return (
		<Container key={ planSlug } className={ tableItemClasses } isTableCell={ isTableCell }>
			<PopularBadge
				isInSignup={ isInSignup }
				planSlug={ planSlug }
				additionalClassName={ popularBadgeClasses }
			/>
			<header className={ headerClasses }>
				{ isBusinessPlan( planSlug ) && (
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
				{ isWpcomEnterpriseGridPlan( planSlug ) && (
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
	state: PlanFeatures2023GridState = {
		showPlansComparisonGrid: false,
		selectedStorage: {},
	};

	plansComparisonGridContainerRef = createRef< HTMLDivElement >();

	componentDidMount() {
		// TODO clk: move these to PlansFeaturesMain (after Woo plans migrate)
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}

	toggleShowPlansComparisonGrid = () => {
		this.setState( ( { showPlansComparisonGrid } ) => ( {
			showPlansComparisonGrid: ! showPlansComparisonGrid,
		} ) );
	};

	setSelectedStorage = ( updatedSelectedStorage: PlanSelectedStorage ) => {
		this.setState( ( { selectedStorage } ) => ( {
			selectedStorage: {
				...selectedStorage,
				...updatedSelectedStorage,
			},
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

	renderTable( renderedGridPlans: GridPlan[] ) {
		const { translate, spotlightPlanSlug, stickyRowOffset, isInSignup } = this.props;
		// Do not render the spotlight plan if it exists
		const gridPlansWithoutSpotlight = renderedGridPlans.filter(
			( { planSlug } ) => ! spotlightPlanSlug || spotlightPlanSlug !== planSlug
		);
		const tableClasses = classNames(
			'plan-features-2023-grid__table',
			`has-${ gridPlansWithoutSpotlight.length }-cols`
		);

		return (
			<table className={ tableClasses }>
				<caption className="plan-features-2023-grid__screen-reader-text screen-reader-text">
					{ translate( 'Available plans to choose from' ) }
				</caption>
				<tbody>
					<tr>{ this.renderPlanLogos( gridPlansWithoutSpotlight, { isTableCell: true } ) }</tr>
					<tr>{ this.renderPlanHeaders( gridPlansWithoutSpotlight, { isTableCell: true } ) }</tr>
					<tr>{ this.renderPlanTagline( gridPlansWithoutSpotlight, { isTableCell: true } ) }</tr>
					<tr>{ this.renderPlanPrice( gridPlansWithoutSpotlight, { isTableCell: true } ) }</tr>
					<tr>
						{ this.renderBillingTimeframe( gridPlansWithoutSpotlight, { isTableCell: true } ) }
					</tr>
					<StickyContainer
						stickyClass="is-sticky-top-buttons-row"
						element="tr"
						stickyOffset={ stickyRowOffset }
						topOffset={ stickyRowOffset + ( isInSignup ? 0 : 20 ) }
					>
						{ ( isStuck: boolean ) =>
							this.renderTopButtons( gridPlansWithoutSpotlight, { isTableCell: true, isStuck } )
						}
					</StickyContainer>
					<tr>{ this.renderTopButtons( gridPlansWithoutSpotlight, { isTableCell: true } ) }</tr>
					<tr>
						{ this.maybeRenderRefundNotice( gridPlansWithoutSpotlight, { isTableCell: true } ) }
					</tr>
					<tr>
						{ this.renderPreviousFeaturesIncludedTitle( gridPlansWithoutSpotlight, {
							isTableCell: true,
						} ) }
					</tr>
					<tr>
						{ this.renderPlanFeaturesList( gridPlansWithoutSpotlight, { isTableCell: true } ) }
					</tr>
					<tr>
						{ this.renderPlanStorageOptions( gridPlansWithoutSpotlight, { isTableCell: true } ) }
					</tr>
				</tbody>
			</table>
		);
	}

	renderTabletView() {
		const { gridPlansForFeaturesGrid, spotlightPlanSlug } = this.props;
		const gridPlansWithoutSpotlight = gridPlansForFeaturesGrid.filter(
			( { planSlug } ) => ! spotlightPlanSlug || spotlightPlanSlug !== planSlug
		);
		const numberOfPlansToShowOnTop = 4 === gridPlansWithoutSpotlight.length ? 2 : 3;
		const plansForTopRow = gridPlansWithoutSpotlight.slice( 0, numberOfPlansToShowOnTop );
		const plansForBottomRow = gridPlansWithoutSpotlight.slice( numberOfPlansToShowOnTop );

		return (
			<>
				<div className="plan-features-2023-grid__table-top">
					{ this.renderTable( plansForTopRow ) }
				</div>
				{ plansForBottomRow.length > 0 && (
					<div className="plan-features-2023-grid__table-bottom">
						{ this.renderTable( plansForBottomRow ) }
					</div>
				) }
			</>
		);
	}

	/**
	 * Similar to `renderMobileView` above.
	 */
	renderSpotlightPlan() {
		const { spotlightPlanSlug, gridPlansForFeaturesGrid } = this.props;
		const spotlightGridPlan = gridPlansForFeaturesGrid.find(
			( { planSlug } ) => spotlightPlanSlug && spotlightPlanSlug === planSlug
		);

		if ( ! spotlightGridPlan ) {
			return;
		}

		const spotlightPlanClasses = classNames(
			'plan-features-2023-grid__plan-spotlight-card',
			getPlanClass( spotlightGridPlan.planSlug )
		);

		return (
			<div className="plan-features-2023-grid__plan-spotlight">
				<div className={ spotlightPlanClasses }>
					{ this.renderPlanLogos( [ spotlightGridPlan ] ) }
					{ this.renderPlanHeaders( [ spotlightGridPlan ] ) }
					{ this.renderPlanTagline( [ spotlightGridPlan ] ) }
					{ this.renderPlanPrice( [ spotlightGridPlan ] ) }
					{ this.renderBillingTimeframe( [ spotlightGridPlan ] ) }
					{ this.renderTopButtons( [ spotlightGridPlan ] ) }
				</div>
			</div>
		);
	}

	renderMobileView() {
		const { translate, selectedFeature, gridPlansForFeaturesGrid, spotlightPlanSlug } = this.props;
		const CardContainer = (
			props: React.ComponentProps< typeof FoldableCard > & { planSlug: string }
		) => {
			const { children, planSlug, ...otherProps } = props;
			return isWpcomEnterpriseGridPlan( planSlug ) ? (
				<div { ...otherProps }>{ children }</div>
			) : (
				<FoldableCard { ...otherProps } compact clickableHeader>
					{ children }
				</FoldableCard>
			);
		};

		return gridPlansForFeaturesGrid
			.reduce( ( acc, griPlan ) => {
				// Bring the spotlight plan to the top
				if ( spotlightPlanSlug && spotlightPlanSlug === griPlan.planSlug ) {
					return [ griPlan ].concat( acc );
				}
				return acc.concat( griPlan );
			}, [] as GridPlan[] )
			.map( ( gridPlan, index ) => {
				const planCardClasses = classNames(
					'plan-features-2023-grid__mobile-plan-card',
					getPlanClass( gridPlan.planSlug )
				);
				const planCardJsx = (
					<div className={ planCardClasses } key={ `${ gridPlan.planSlug }-${ index }` }>
						{ this.renderPlanLogos( [ gridPlan ] ) }
						{ this.renderPlanHeaders( [ gridPlan ] ) }
						{ this.renderPlanTagline( [ gridPlan ] ) }
						{ this.renderPlanPrice( [ gridPlan ] ) }
						{ this.renderBillingTimeframe( [ gridPlan ] ) }
						{ this.renderMobileFreeDomain( gridPlan.planSlug, gridPlan.isMonthlyPlan ) }
						{ this.renderTopButtons( [ gridPlan ] ) }
						{ this.maybeRenderRefundNotice( [ gridPlan ] ) }
						<CardContainer
							header={ translate( 'Show all features' ) }
							planSlug={ gridPlan.planSlug }
							key={ `${ gridPlan.planSlug }-${ index }` }
							expanded={
								selectedFeature &&
								gridPlan.features.wpcomFeatures.some(
									( feature ) => feature.getSlug() === selectedFeature
								)
							}
						>
							{ this.renderPreviousFeaturesIncludedTitle( [ gridPlan ] ) }
							{ this.renderPlanFeaturesList( [ gridPlan ] ) }
							{ this.renderPlanStorageOptions( [ gridPlan ] ) }
						</CardContainer>
					</div>
				);
				return planCardJsx;
			} );
	}

	renderMobileFreeDomain( planSlug: PlanSlug, isMonthlyPlan?: boolean ) {
		const { translate } = this.props;

		if ( isMonthlyPlan || isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug ) ) {
			return null;
		}
		const { paidDomainName } = this.props;

		const displayText = paidDomainName
			? translate( '%(paidDomainName)s is included', {
					args: { paidDomainName },
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

	renderPlanPrice( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const {
			isReskinned,
			isLargeCurrency,
			translate,
			isPlanUpgradeCreditEligible,
			currentSitePlanSlug,
			siteId,
		} = this.props;
		return renderedGridPlans.map( ( { planSlug } ) => {
			const isWooExpressPlus = isWooExpressPlusPlan( planSlug );
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-bottom-aligned', {
				'has-border-top': ! isReskinned,
			} );

			return (
				<Container
					scope="col"
					key={ planSlug }
					className={ classes }
					isTableCell={ options?.isTableCell }
				>
					<PlanFeatures2023GridHeaderPrice
						planSlug={ planSlug }
						isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
						isLargeCurrency={ isLargeCurrency }
						currentSitePlanSlug={ currentSitePlanSlug }
						siteId={ siteId }
					/>
					{ isWooExpressPlus && (
						<div className="plan-features-2023-grid__header-tagline">
							{ translate( 'Speak to our team for a custom quote.' ) }
						</div>
					) }
				</Container>
			);
		} );
	}

	renderBillingTimeframe( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		return renderedGridPlans.map( ( { planConstantObj, planSlug } ) => {
			const classes = classNames(
				'plan-features-2023-grid__table-item',
				'plan-features-2023-grid__header-billing-info'
			);

			return (
				<Container className={ classes } isTableCell={ options?.isTableCell } key={ planSlug }>
					<PlanFeatures2023GridBillingTimeframe
						planSlug={ planSlug }
						billingTimeframe={ planConstantObj.getBillingTimeFrame() }
					/>
				</Container>
			);
		} );
	}

	renderPlanLogos( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const { isInSignup } = this.props;

		return renderedGridPlans.map( ( { planSlug }, index ) => {
			return (
				<PlanLogo
					key={ planSlug }
					planIndex={ index }
					planSlug={ planSlug }
					renderedGridPlans={ renderedGridPlans }
					isTableCell={ options?.isTableCell }
					isInSignup={ isInSignup }
				/>
			);
		} );
	}

	renderPlanHeaders( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		return renderedGridPlans.map( ( { planSlug, planConstantObj } ) => {
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planSlug )
			);

			return (
				<Container
					key={ planSlug }
					className="plan-features-2023-grid__table-item"
					isTableCell={ options?.isTableCell }
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

	renderPlanTagline( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		return renderedGridPlans.map( ( { planSlug, tagline } ) => {
			return (
				<Container
					key={ planSlug }
					className="plan-features-2023-grid__table-item"
					isTableCell={ options?.isTableCell }
				>
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
				</Container>
			);
		} );
	}

	handleUpgradeClick = ( planSlug: PlanSlug ) => {
		const { onUpgradeClick: ownPropsOnUpgradeClick, gridPlansForFeaturesGrid } = this.props;
		const { cartItemForPlan } =
			gridPlansForFeaturesGrid.find( ( gridPlan ) => gridPlan.planSlug === planSlug ) ?? {};

		// TODO clk: Revisit. Could this suffice: `ownPropsOnUpgradeClick?.( cartItemForPlan )`

		if ( cartItemForPlan ) {
			ownPropsOnUpgradeClick?.( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planSlug ) ) {
			ownPropsOnUpgradeClick?.( null );
			return;
		}
	};

	renderTopButtons( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
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
			siteId,
			isLargeCurrency,
		} = this.props;

		return renderedGridPlans.map(
			( { planSlug, planConstantObj, current, availableForPurchase } ) => {
				const classes = classNames(
					'plan-features-2023-grid__table-item',
					'is-top-buttons',
					'is-bottom-aligned'
				);

				// Leaving it `undefined` makes it use the default label
				let buttonText;

				if (
					isWooExpressMediumPlan( planSlug ) &&
					! isWooExpressMediumPlan( currentSitePlanSlug || '' )
				) {
					buttonText = translate( 'Get Performance', { textOnly: true } );
				} else if (
					isWooExpressSmallPlan( planSlug ) &&
					! isWooExpressSmallPlan( currentSitePlanSlug || '' )
				) {
					buttonText = translate( 'Get Essential', { textOnly: true } );
				}

				return (
					<Container key={ planSlug } className={ classes } isTableCell={ options?.isTableCell }>
						<PlanFeatures2023GridActions
							manageHref={ manageHref }
							canUserPurchasePlan={ canUserPurchasePlan }
							availableForPurchase={ availableForPurchase }
							className={ getPlanClass( planSlug ) }
							freePlan={ isFreePlan( planSlug ) }
							isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planSlug ) }
							isWooExpressPlusPlan={ isWooExpressPlusPlan( planSlug ) }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							onUpgradeClick={ () => this.handleUpgradeClick( planSlug ) }
							planTitle={ planConstantObj.getTitle() }
							planSlug={ planSlug }
							flowName={ flowName }
							current={ current ?? false }
							currentSitePlanSlug={ currentSitePlanSlug }
							selectedSiteSlug={ selectedSiteSlug }
							buttonText={ buttonText }
							planActionOverrides={ planActionOverrides }
							showMonthlyPrice={ true }
							siteId={ siteId }
							isStuck={ options?.isStuck || false }
							isLargeCurrency={ isLargeCurrency }
						/>
					</Container>
				);
			}
		);
	}

	maybeRenderRefundNotice( gridPlan: GridPlan[], options?: PlanRowOptions ) {
		const { translate, flowName } = this.props;

		if ( ! isAnyHostingFlow( flowName ) ) {
			return false;
		}

		return gridPlan.map( ( { planSlug, pricing: { billingPeriod } } ) => (
			<Container
				key={ planSlug }
				className="plan-features-2023-grid__table-item"
				isTableCell={ options?.isTableCell }
			>
				{ ! isFreePlan( planSlug ) && (
					<div className={ `plan-features-2023-grid__refund-notice ${ getPlanClass( planSlug ) }` }>
						{ translate( 'Refundable within %(dayCount)s days. No questions asked.', {
							args: {
								dayCount: billingPeriod === 365 ? 14 : 7,
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

	renderPreviousFeaturesIncludedTitle( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const { translate, gridPlansForFeaturesGrid } = this.props;

		return renderedGridPlans.map( ( { planSlug } ) => {
			const shouldRenderEnterpriseLogos =
				isWpcomEnterpriseGridPlan( planSlug ) || isWooExpressPlusPlan( planSlug );
			const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug ) && ! shouldRenderEnterpriseLogos;
			const indexInGridPlansForFeaturesGrid = gridPlansForFeaturesGrid.findIndex(
				( { planSlug: slug } ) => slug === planSlug
			);
			const previousProductName =
				indexInGridPlansForFeaturesGrid > 0
					? gridPlansForFeaturesGrid[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
					: null;
			const title =
				previousProductName &&
				translate( 'Everything in %(planShortName)s, plus:', {
					args: { planShortName: previousProductName },
				} );
			const classes = classNames(
				'plan-features-2023-grid__common-title',
				getPlanClass( planSlug )
			);
			const rowspanProp =
				! options?.isTableCell && shouldRenderEnterpriseLogos ? { rowSpan: '2' } : {};
			return (
				<Container
					key={ planSlug }
					isTableCell={ options?.isTableCell }
					className="plan-features-2023-grid__table-item"
					{ ...rowspanProp }
				>
					{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
					{ shouldRenderEnterpriseLogos && this.renderEnterpriseClientLogos() }
				</Container>
			);
		} );
	}

	renderPlanFeaturesList( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const {
			paidDomainName,
			translate,
			hideUnavailableFeatures,
			selectedFeature,
			wpcomFreeDomainSuggestion,
			isCustomDomainAllowedOnFreePlan,
		} = this.props;
		const plansWithFeatures = renderedGridPlans.filter(
			( gridPlan ) =>
				! isWpcomEnterpriseGridPlan( gridPlan.planSlug ) &&
				! isWooExpressPlusPlan( gridPlan.planSlug )
		);

		return plansWithFeatures.map(
			( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
				return (
					<Container
						key={ `${ planSlug }-${ mapIndex }` }
						isTableCell={ options?.isTableCell }
						className="plan-features-2023-grid__table-item"
					>
						<PlanFeatures2023GridFeatures
							features={ wpcomFeatures }
							planSlug={ planSlug }
							paidDomainName={ paidDomainName }
							wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							selectedFeature={ selectedFeature }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						/>
						{ jetpackFeatures.length !== 0 && (
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
							features={ jetpackFeatures }
							planSlug={ planSlug }
							paidDomainName={ paidDomainName }
							wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						/>
					</Container>
				);
			}
		);
	}

	renderPlanStorageOptions( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const { translate, intervalType, showUpgradeableStorage } = this.props;
		const { selectedStorage } = this.state;

		return renderedGridPlans.map( ( { planSlug, features: { storageOptions } } ) => {
			if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
				return null;
			}

			const shouldRenderStorageTitle =
				storageOptions.length === 1 ||
				( intervalType !== 'yearly' && storageOptions.length > 0 ) ||
				( ! showUpgradeableStorage && storageOptions.length > 0 );
			const canUpgradeStorageForPlan =
				storageOptions.length > 1 && intervalType === 'yearly' && showUpgradeableStorage;

			const storageJSX = canUpgradeStorageForPlan ? (
				<StorageAddOnDropdown
					planSlug={ planSlug }
					storageOptions={ storageOptions }
					selectedStorage={ selectedStorage }
					setSelectedStorage={ this.setSelectedStorage }
				/>
			) : (
				storageOptions.map( ( storageOption ) => {
					if ( ! storageOption?.isAddOn ) {
						return (
							<div className="plan-features-2023-grid__storage-buttons" key={ planSlug }>
								{ getStorageStringFromFeature( storageOption?.slug ) }
							</div>
						);
					}
				} )
			);

			return (
				<Container
					key={ planSlug }
					className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
					isTableCell={ options?.isTableCell }
				>
					{ shouldRenderStorageTitle ? (
						<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
					) : null }
					{ storageJSX }
				</Container>
			);
		} );
	}

	render() {
		const {
			isInSignup,
			planTypeSelectorProps,
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
			isGlobalStylesOnPersonal,
			gridPlansForFeaturesGrid,
			gridPlansForComparisonGrid,
			showLegacyStorageFeature,
			usePricingMetaForGridPlans,
			allFeaturesList,
		} = this.props;

		return (
			<div className="plans-wrapper">
				<QueryActivePromotions />
				<div className="plan-features">
					<PlansGridContextProvider
						intent={ intent }
						gridPlans={ gridPlansForFeaturesGrid }
						usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
						allFeaturesList={ allFeaturesList }
					>
						<div className="plan-features-2023-grid__content">
							<div>
								<div className="plan-features-2023-grid__desktop-view">
									{ this.renderTable( gridPlansForFeaturesGrid ) }
								</div>
								<div className="plan-features-2023-grid__tablet-view">
									{ this.renderTabletView() }
								</div>
								<div className="plan-features-2023-grid__mobile-view">
									{ this.renderMobileView() }
								</div>
							</div>
						</div>
					</PlansGridContextProvider>
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
						<PlansGridContextProvider
							intent={ intent }
							gridPlans={ gridPlansForComparisonGrid }
							usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
							allFeaturesList={ allFeaturesList }
						>
							<PlanComparisonGrid
								planTypeSelectorProps={ planTypeSelectorProps }
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
								isGlobalStylesOnPersonal={ isGlobalStylesOnPersonal }
								showLegacyStorageFeature={ showLegacyStorageFeature }
							/>
							<div className="plan-features-2023-grid__toggle-plan-comparison-button-container">
								<Button onClick={ this.toggleShowPlansComparisonGrid }>
									{ translate( 'Hide comparison' ) }
								</Button>
							</div>
						</PlansGridContextProvider>
					</div>
				) : null }
			</div>
		);
	}
}

const withIsLargeCurrency = ( Component: LocalizedComponent< typeof PlanFeatures2023Grid > ) => {
	return function ( props: PlanFeatures2023GridType ) {
		const isLargeCurrency = useIsLargeCurrency( {
			gridPlans: props.gridPlansForFeaturesGrid,
		} );
		return <Component { ...props } isLargeCurrency={ isLargeCurrency } />;
	};
};

/* eslint-disable wpcalypso/redux-no-bound-selectors */
const ConnectedPlanFeatures2023Grid = connect(
	( state: IAppState, ownProps: PlanFeatures2023GridType ) => {
		const { siteId } = ownProps;
		// TODO clk: canUserManagePlan should be passed through props instead of being calculated here
		const canUserPurchasePlan = siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null;
		const purchaseId = siteId && getCurrentPlanPurchaseId( state, siteId );
		// TODO clk: selectedSiteSlug has no other use than computing manageRef below. stop propagating it through props
		const selectedSiteSlug = getSiteSlug( state, siteId );

		const manageHref =
			purchaseId && selectedSiteSlug
				? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
				: `/plans/my-plan/${ siteId }`;

		return {
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
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
		props.siteId,
		props.gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug )
	);

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
