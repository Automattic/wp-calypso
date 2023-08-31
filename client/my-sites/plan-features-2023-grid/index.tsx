import {
	getPlanClass,
	isFreePlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
	PlanSlug,
	isWooExpressPlusPlan,
	FeatureList,
} from '@automattic/calypso-products';
import {
	BloombergLogo,
	CNNLogo,
	CondenastLogo,
	DisneyLogo,
	FacebookLogo,
	SalesforceLogo,
	SlackLogo,
	TimeLogo,
} from '@automattic/components';
import { isAnyHostingFlow } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { LocalizeProps, useTranslate } from 'i18n-calypso';
import { Component, ForwardedRef, forwardRef, createRef } from 'react';
import { useSelector } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import FoldableCard from 'calypso/components/foldable-card';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
import { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import { getManagePurchaseUrlFor } from '../purchases/paths';
import PlanFeatures2023GridActions from './components/actions';
import PlanFeatures2023GridBillingTimeframe from './components/billing-timeframe';
import PlanFeatures2023GridHeaderPrice from './components/header-price';
import { PlanFeaturesItem } from './components/item';
import { PlanComparisonGrid } from './components/plan-comparison-grid';
import PlanDivOrTdContainer from './components/plan-div-td-container';
import PlanFeaturesContainer from './components/plan-features-container';
import PlanLogo from './components/plan-logo';
import { StickyContainer } from './components/sticky-container';
import StorageAddOnDropdown from './components/storage-add-on-dropdown';
import PlansGridContextProvider, { type PlansIntent } from './grid-context';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import { DataResponse } from './types';
import { getStorageStringFromFeature } from './util';
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

export interface PlanFeatures2023GridProps {
	gridPlansForFeaturesGrid: GridPlan[];
	gridPlansForComparisonGrid: GridPlan[];
	gridPlanForSpotlight?: GridPlan;
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
	showLegacyStorageFeature?: boolean;
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	showOdie?: () => void;
	// temporary
	showPlansComparisonGrid: boolean;
	// temporary
	toggleShowPlansComparisonGrid: () => void;
	planTypeSelectorProps: PlanTypeSelectorProps;
}

interface PlanFeatures2023GridType extends PlanFeatures2023GridProps {
	isLargeCurrency: boolean;
	translate: LocalizeProps[ 'translate' ];
	canUserPurchasePlan: boolean | null;
	manageHref: string;
	selectedSiteSlug: string | null;
	isPlanUpgradeCreditEligible: boolean;
	// temporary: element ref to scroll comparison grid into view once "Compare plans" button is clicked
	plansComparisonGridRef: ForwardedRef< HTMLDivElement >;
}

export class PlanFeatures2023Grid extends Component< PlanFeatures2023GridType > {
	observer: IntersectionObserver | null = null;
	buttonRef: React.RefObject< HTMLButtonElement > = createRef< HTMLButtonElement >();

	componentDidMount() {
		this.observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					this.props.showOdie?.();
					this.observer?.disconnect();
				}
			} );
		} );

		if ( this.buttonRef.current ) {
			this.observer.observe( this.buttonRef.current );
		}
	}

	componentWillUnmount() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
	}

	renderTable( renderedGridPlans: GridPlan[] ) {
		const { translate, gridPlanForSpotlight, stickyRowOffset, isInSignup } = this.props;
		// Do not render the spotlight plan if it exists
		const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
			? renderedGridPlans
			: renderedGridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
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
		const { gridPlansForFeaturesGrid, gridPlanForSpotlight } = this.props;
		const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
			? gridPlansForFeaturesGrid
			: gridPlansForFeaturesGrid.filter(
					( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug
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
		const { gridPlanForSpotlight } = this.props;

		if ( ! gridPlanForSpotlight ) {
			return null;
		}

		const spotlightPlanClasses = classNames(
			'plan-features-2023-grid__plan-spotlight-card',
			getPlanClass( gridPlanForSpotlight.planSlug )
		);

		return (
			<div className="plan-features-2023-grid__plan-spotlight">
				<div className={ spotlightPlanClasses }>
					{ this.renderPlanLogos( [ gridPlanForSpotlight ] ) }
					{ this.renderPlanHeaders( [ gridPlanForSpotlight ] ) }
					{ this.renderPlanTagline( [ gridPlanForSpotlight ] ) }
					{ this.renderPlanPrice( [ gridPlanForSpotlight ] ) }
					{ this.renderBillingTimeframe( [ gridPlanForSpotlight ] ) }
					{ this.renderTopButtons( [ gridPlanForSpotlight ] ) }
				</div>
			</div>
		);
	}

	renderMobileView() {
		const { translate, selectedFeature, gridPlansForFeaturesGrid, gridPlanForSpotlight } =
			this.props;
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
				if ( gridPlanForSpotlight?.planSlug === griPlan.planSlug ) {
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
				<PlanDivOrTdContainer
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
				</PlanDivOrTdContainer>
			);
		} );
	}

	renderBillingTimeframe( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		return renderedGridPlans.map( ( { planSlug } ) => {
			const classes = classNames(
				'plan-features-2023-grid__table-item',
				'plan-features-2023-grid__header-billing-info'
			);

			return (
				<PlanDivOrTdContainer
					className={ classes }
					isTableCell={ options?.isTableCell }
					key={ planSlug }
				>
					<PlanFeatures2023GridBillingTimeframe planSlug={ planSlug } />
				</PlanDivOrTdContainer>
			);
		} );
	}

	renderPlanLogos( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const { isInSignup } = this.props;

		return renderedGridPlans.map( ( { planSlug }, index ) => {
			return (
				<PlanLogo
					key={ planSlug }
					planSlug={ planSlug }
					planIndex={ index }
					renderedGridPlans={ renderedGridPlans }
					isInSignup={ isInSignup }
					isTableCell={ options?.isTableCell }
				/>
			);
		} );
	}

	renderPlanHeaders( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		return renderedGridPlans.map( ( { planSlug, planTitle } ) => {
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planSlug )
			);

			return (
				<PlanDivOrTdContainer
					key={ planSlug }
					className="plan-features-2023-grid__table-item"
					isTableCell={ options?.isTableCell }
				>
					<header className={ headerClasses }>
						<h4 className="plan-features-2023-grid__header-title">{ planTitle }</h4>
					</header>
				</PlanDivOrTdContainer>
			);
		} );
	}

	renderPlanTagline( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		return renderedGridPlans.map( ( { planSlug, tagline } ) => {
			return (
				<PlanDivOrTdContainer
					key={ planSlug }
					className="plan-features-2023-grid__table-item"
					isTableCell={ options?.isTableCell }
				>
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
				</PlanDivOrTdContainer>
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

		return renderedGridPlans.map( ( { planSlug, availableForPurchase } ) => {
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
				<PlanDivOrTdContainer
					key={ planSlug }
					className={ classes }
					isTableCell={ options?.isTableCell }
				>
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
						planSlug={ planSlug }
						flowName={ flowName }
						currentSitePlanSlug={ currentSitePlanSlug }
						selectedSiteSlug={ selectedSiteSlug }
						buttonText={ buttonText }
						planActionOverrides={ planActionOverrides }
						showMonthlyPrice={ true }
						siteId={ siteId }
						isStuck={ options?.isStuck || false }
						isLargeCurrency={ isLargeCurrency }
					/>
				</PlanDivOrTdContainer>
			);
		} );
	}

	maybeRenderRefundNotice( gridPlan: GridPlan[], options?: PlanRowOptions ) {
		const { translate, flowName } = this.props;

		if ( ! isAnyHostingFlow( flowName ) ) {
			return false;
		}

		return gridPlan.map( ( { planSlug, pricing: { billingPeriod } } ) => (
			<PlanDivOrTdContainer
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
			</PlanDivOrTdContainer>
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
				options?.isTableCell && shouldRenderEnterpriseLogos ? { rowSpan: '2' } : {};
			return (
				<PlanDivOrTdContainer
					key={ planSlug }
					isTableCell={ options?.isTableCell }
					className="plan-features-2023-grid__table-item"
					{ ...rowspanProp }
				>
					{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
					{ shouldRenderEnterpriseLogos && this.renderEnterpriseClientLogos() }
				</PlanDivOrTdContainer>
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

		return (
			<PlanFeaturesContainer
				plansWithFeatures={ plansWithFeatures }
				paidDomainName={ paidDomainName }
				wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
				translate={ translate }
				hideUnavailableFeatures={ hideUnavailableFeatures }
				selectedFeature={ selectedFeature }
				isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
				isTableCell={ options?.isTableCell }
			/>
		);
	}

	renderPlanStorageOptions( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const { translate, intervalType, showUpgradeableStorage } = this.props;

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
					label={ translate( 'Storage' ) }
					planSlug={ planSlug }
					storageOptions={ storageOptions }
					displayCost
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
				<PlanDivOrTdContainer
					key={ planSlug }
					className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
					isTableCell={ options?.isTableCell }
				>
					{ shouldRenderStorageTitle ? (
						<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
					) : null }
					{ storageJSX }
				</PlanDivOrTdContainer>
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
			gridPlansForFeaturesGrid,
			gridPlansForComparisonGrid,
			showLegacyStorageFeature,
			usePricingMetaForGridPlans,
			allFeaturesList,
			plansComparisonGridRef,
			toggleShowPlansComparisonGrid,
			showPlansComparisonGrid,
		} = this.props;

		return (
			<div className="plans-wrapper">
				<QueryActivePromotions />
				<PlansGridContextProvider
					intent={ intent }
					gridPlans={ gridPlansForFeaturesGrid }
					usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
					allFeaturesList={ allFeaturesList }
				>
					{ this.renderSpotlightPlan() }
				</PlansGridContextProvider>
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
						<Button onClick={ toggleShowPlansComparisonGrid } ref={ this.buttonRef }>
							{ showPlansComparisonGrid
								? translate( 'Hide comparison' )
								: translate( 'Compare plans' ) }
						</Button>
					</div>
				) }
				{ ! hidePlansFeatureComparison && showPlansComparisonGrid ? (
					<div
						ref={ plansComparisonGridRef }
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
								showLegacyStorageFeature={ showLegacyStorageFeature }
							/>
							<div className="plan-features-2023-grid__toggle-plan-comparison-button-container">
								<Button onClick={ toggleShowPlansComparisonGrid }>
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

export default forwardRef< HTMLDivElement, PlanFeatures2023GridProps >(
	function WrappedPlanFeatures2023Grid( props, ref ) {
		const { siteId } = props;
		const translate = useTranslate();
		const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
			props.siteId,
			props.gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug )
		);
		const isLargeCurrency = useIsLargeCurrency( {
			gridPlans: props.gridPlansForFeaturesGrid,
		} );

		// TODO clk: canUserManagePlan should be passed through props instead of being calculated here
		const canUserPurchasePlan = useSelector( ( state: IAppState ) =>
			siteId
				? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
				: null
		);
		const purchaseId = useSelector( ( state: IAppState ) =>
			siteId ? getCurrentPlanPurchaseId( state, siteId ) : null
		);
		// TODO clk: selectedSiteSlug has no other use than computing manageRef below. stop propagating it through props
		const selectedSiteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );

		const manageHref =
			purchaseId && selectedSiteSlug
				? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
				: `/plans/my-plan/${ siteId }`;

		if ( props.isInSignup ) {
			return (
				<PlanFeatures2023Grid
					{ ...props }
					plansComparisonGridRef={ ref }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserPurchasePlan={ canUserPurchasePlan }
					manageHref={ manageHref }
					selectedSiteSlug={ selectedSiteSlug }
					translate={ translate }
				/>
			);
		}

		return (
			<CalypsoShoppingCartProvider>
				<PlanFeatures2023Grid
					{ ...props }
					plansComparisonGridRef={ ref }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserPurchasePlan={ canUserPurchasePlan }
					manageHref={ manageHref }
					selectedSiteSlug={ selectedSiteSlug }
					translate={ translate }
				/>
			</CalypsoShoppingCartProvider>
		);
	}
);
