import {
	PlanSlug,
	WPComStorageAddOnSlug,
	getPlanClass,
	isBusinessPlan,
	isEcommercePlan,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	isWooExpressMediumPlan,
	isWooExpressPlan,
	isWooExpressPlusPlan,
	isWooExpressSmallPlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import {
	BloombergLogo,
	CNNLogo,
	CloudLogo,
	CondenastLogo,
	DisneyLogo,
	FacebookLogo,
	JetpackLogo,
	SalesforceLogo,
	SlackLogo,
	TimeLogo,
	VIPLogo,
	WooLogo,
} from '@automattic/components';
import { isAnyHostingFlow } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Component, createRef, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import FoldableCard from 'calypso/components/foldable-card';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
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
import { Container } from './grid-parts/container';
import PlanStorageOptions from './grid-parts/plan-storage-options';
import PreviousPlanFeaturesIncludedSection from './grid-parts/previous-plan-features-included';
import SpotlightPlans from './grid-parts/spotlight-plans';
import useHighlightAdjacencyMatrix from './hooks/npm-ready/use-highlight-adjacency-matrix';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import { getStorageStringFromFeature } from './util';
import type { GridPlan } from './hooks/npm-ready/data-store/use-grid-plans';
import type { PlanFeatures2023GridProps, PlanFeatures2023GridType, PlanRowOptions } from './types';
import type { IAppState } from 'calypso/state/types';
import './style.scss';

export type PlanSelectedStorage = { [ key: string ]: WPComStorageAddOnSlug | null };

export const PlanLogo: React.FunctionComponent< {
	planIndex?: number;
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
		const {
			translate,
			gridPlanForSpotlight,
			stickyRowOffset,
			isInSignup,
			isReskinned,
			isLargeCurrency,
			isPlanUpgradeCreditEligible,
			currentSitePlanSlug,
			siteId,
			canUserPurchasePlan,
			manageHref,
			isLaunchPage,
			flowName,
			selectedSiteSlug,
			planActionOverrides,
			paidDomainName,
			hideUnavailableFeatures,
			selectedFeature,
			wpcomFreeDomainSuggestion,
			isCustomDomainAllowedOnFreePlan,
			showUpgradeableStorage,
			intervalType,
		} = this.props;
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
					<tr>
						{ gridPlansWithoutSpotlight.map( ( { planSlug }, index ) => (
							<PlanLogo
								key={ planSlug }
								planIndex={ index }
								planSlug={ planSlug }
								renderedGridPlans={ renderedGridPlans }
								isTableCell={ true }
								isInSignup={ isInSignup }
							/>
						) ) }
					</tr>
					{ /* PlanHeaders */ }
					<tr>
						{ gridPlansWithoutSpotlight.map( ( { planSlug, planConstantObj } ) => (
							<Container
								key={ planSlug }
								className="plan-features-2023-grid__table-item"
								isTableCell={ true }
							>
								<header
									className={ classNames(
										'plan-features-2023-grid__header',
										getPlanClass( planSlug )
									) }
								>
									<h4 className="plan-features-2023-grid__header-title">
										{ planConstantObj.getTitle() }
									</h4>
								</header>
							</Container>
						) ) }
					</tr>
					{ /* PlanTagline */ }
					<tr>
						{ gridPlansWithoutSpotlight.map( ( { planSlug, tagline } ) => {
							return (
								<Container
									key={ planSlug }
									className="plan-features-2023-grid__table-item"
									isTableCell={ true }
								>
									<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
								</Container>
							);
						} ) }
					</tr>
					{ /* PlanPrice */ }
					<tr>
						{ gridPlansWithoutSpotlight.map( ( { planSlug } ) => {
							return (
								<Container
									scope="col"
									key={ planSlug }
									className={ classNames(
										'plan-features-2023-grid__table-item',
										'is-bottom-aligned',
										{
											'has-border-top': ! isReskinned,
										}
									) }
									isTableCell={ true }
								>
									<PlanFeatures2023GridHeaderPrice
										planSlug={ planSlug }
										isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
										isLargeCurrency={ isLargeCurrency }
										currentSitePlanSlug={ currentSitePlanSlug }
										siteId={ siteId }
									/>
									{ isWooExpressPlusPlan( planSlug ) && (
										<div className="plan-features-2023-grid__header-tagline">
											{ translate( 'Speak to our team for a custom quote.' ) }
										</div>
									) }
								</Container>
							);
						} ) }
					</tr>
					{ /* BillingTimeframe */ }
					<tr>
						{ gridPlansWithoutSpotlight.map( ( { planConstantObj, planSlug } ) => {
							return (
								<Container
									className={ classNames(
										'plan-features-2023-grid__table-item',
										'plan-features-2023-grid__header-billing-info'
									) }
									isTableCell={ true }
									key={ planSlug }
								>
									<PlanFeatures2023GridBillingTimeframe
										planSlug={ planSlug }
										billingTimeframe={ planConstantObj.getBillingTimeFrame() }
									/>
								</Container>
							);
						} ) }
					</tr>
					{ /* TopButtons */ }
					<StickyContainer
						stickyClass="is-sticky-top-buttons-row"
						element="tr"
						stickyOffset={ stickyRowOffset }
						topOffset={ stickyRowOffset + ( isInSignup ? 0 : 20 ) }
					>
						{ ( isStuck: boolean ) => {
							return gridPlansWithoutSpotlight.map(
								( { planSlug, planConstantObj, current, availableForPurchase } ) => {
									return (
										<Container
											key={ planSlug }
											className={ classNames(
												'plan-features-2023-grid__table-item',
												'is-top-buttons',
												'is-bottom-aligned'
											) }
											isTableCell={ true }
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
												planTitle={ planConstantObj.getTitle() }
												planSlug={ planSlug }
												flowName={ flowName }
												current={ current ?? false }
												currentSitePlanSlug={ currentSitePlanSlug }
												selectedSiteSlug={ selectedSiteSlug }
												planActionOverrides={ planActionOverrides }
												showMonthlyPrice={ true }
												siteId={ siteId }
												isStuck={ isStuck || false }
												isLargeCurrency={ isLargeCurrency }
											/>
										</Container>
									);
								}
							);
						} }
					</StickyContainer>
					{ /* RefundNotice */ }
					<tr>
						{ isAnyHostingFlow( flowName )
							? gridPlansWithoutSpotlight.map( ( { planSlug, pricing: { billingPeriod } } ) => (
									<Container
										key={ planSlug }
										className="plan-features-2023-grid__table-item"
										isTableCell={ true }
									>
										{ ! isFreePlan( planSlug ) && (
											<div
												className={ `plan-features-2023-grid__refund-notice ${ getPlanClass(
													planSlug
												) }` }
											>
												{ translate( 'Refundable within %(dayCount)s days. No questions asked.', {
													args: {
														dayCount: billingPeriod === 365 ? 14 : 7,
													},
												} ) }
											</div>
										) }
									</Container>
							  ) )
							: null }
					</tr>
					<tr>
						{ renderedGridPlans.map( ( { planSlug } ) => (
							<PreviousPlanFeaturesIncludedSection
								planSlug={ planSlug }
								gridPlansForFeaturesGrid={ this.props.gridPlansForFeaturesGrid }
								options={ { isTableCell: true } }
							/>
						) ) }
					</tr>
					<tr>
						{ /* PlanFeaturesList */ }
						{ gridPlansWithoutSpotlight
							.filter(
								( gridPlan ) =>
									! isWpcomEnterpriseGridPlan( gridPlan.planSlug ) &&
									! isWooExpressPlusPlan( gridPlan.planSlug )
							)
							.map( ( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
								return (
									<Container
										key={ `${ planSlug }-${ mapIndex }` }
										isTableCell={ true }
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
							} ) }
					</tr>
					<tr>
						{ gridPlansWithoutSpotlight.map( ( gridPlan ) => (
							<PlanStorageOptions
								storageOptions={ gridPlan.features.storageOptions }
								planSlug={ gridPlan.planSlug }
								intervalType={ intervalType }
								showUpgradeableStorage={ showUpgradeableStorage }
								options={ { isTableCell: true } }
							/>
						) ) }
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

	renderMobileView() {
		const {
			translate,
			selectedFeature,
			gridPlansForFeaturesGrid,
			gridPlanForSpotlight,
			canUserPurchasePlan,
			isInSignup,
			manageHref,
			isLaunchPage,
			flowName,
			currentSitePlanSlug,
			selectedSiteSlug,
			planActionOverrides,
			siteId,
			isLargeCurrency,
			isReskinned,
			isPlanUpgradeCreditEligible,
			paidDomainName,
			hideUnavailableFeatures,
			wpcomFreeDomainSuggestion,
			isCustomDomainAllowedOnFreePlan,
			intervalType,
			showUpgradeableStorage,
		} = this.props;
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
						<PlanLogo
							key={ gridPlan.planSlug }
							planSlug={ gridPlan.planSlug }
							renderedGridPlans={ [ gridPlan ] }
							isTableCell={ false }
							isInSignup={ isInSignup }
						/>
						{ /* PlanHeaders */ }
						<Container
							key={ gridPlan.planSlug }
							className="plan-features-2023-grid__table-item"
							isTableCell={ false }
						>
							<header
								className={ classNames(
									'plan-features-2023-grid__header',
									getPlanClass( gridPlan.planSlug )
								) }
							>
								<h4 className="plan-features-2023-grid__header-title">
									{ gridPlan.planConstantObj.getTitle() }
								</h4>
							</header>
						</Container>

						{ /* PlanTagline */ }
						<Container
							key={ gridPlan.planSlug }
							className="plan-features-2023-grid__table-item"
							isTableCell={ false }
						>
							<div className="plan-features-2023-grid__header-tagline">{ gridPlan.tagline }</div>
						</Container>

						{ /* PlanPrice */ }
						<Container
							scope="col"
							key={ gridPlan.planSlug }
							className={ classNames( 'plan-features-2023-grid__table-item', 'is-bottom-aligned', {
								'has-border-top': ! isReskinned,
							} ) }
							isTableCell={ true }
						>
							<PlanFeatures2023GridHeaderPrice
								planSlug={ gridPlan.planSlug }
								isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
								isLargeCurrency={ isLargeCurrency }
								currentSitePlanSlug={ currentSitePlanSlug }
								siteId={ siteId }
							/>
							{ isWooExpressPlusPlan( gridPlan.planSlug ) && (
								<div className="plan-features-2023-grid__header-tagline">
									{ translate( 'Speak to our team for a custom quote.' ) }
								</div>
							) }
						</Container>

						{ /* BillingTimeframe */ }
						<Container
							className={ classNames(
								'plan-features-2023-grid__table-item',
								'plan-features-2023-grid__header-billing-info'
							) }
							isTableCell={ false }
							key={ gridPlan.planSlug }
						>
							<PlanFeatures2023GridBillingTimeframe
								planSlug={ gridPlan.planSlug }
								billingTimeframe={ gridPlan.planConstantObj.getBillingTimeFrame() }
							/>
						</Container>

						{ /* MobileFreeDomain */ }
						{ gridPlan.isMonthlyPlan ||
						isWpComFreePlan( gridPlan.planSlug ) ||
						isWpcomEnterpriseGridPlan( gridPlan.planSlug ) ? (
							<div className="plan-features-2023-grid__highlighted-feature">
								<PlanFeaturesItem>
									<span className="plan-features-2023-grid__item-info is-annual-plan-feature is-available">
										<span className="plan-features-2023-grid__item-title is-bold">
											{ paidDomainName
												? translate( '%(paidDomainName)s is included', {
														args: { paidDomainName },
												  } )
												: translate( 'Free domain for one year' ) }
										</span>
									</span>
								</PlanFeaturesItem>
							</div>
						) : null }
						{ /* TopButtons */ }
						<Container
							key={ gridPlan.planSlug }
							className={ classNames(
								'plan-features-2023-grid__table-item',
								'is-top-buttons',
								'is-bottom-aligned'
							) }
							isTableCell={ false }
						>
							<PlanFeatures2023GridActions
								manageHref={ manageHref }
								canUserPurchasePlan={ canUserPurchasePlan }
								availableForPurchase={ gridPlan.availableForPurchase }
								className={ getPlanClass( gridPlan.planSlug ) }
								freePlan={ isFreePlan( gridPlan.planSlug ) }
								isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( gridPlan.planSlug ) }
								isWooExpressPlusPlan={ isWooExpressPlusPlan( gridPlan.planSlug ) }
								isInSignup={ isInSignup }
								isLaunchPage={ isLaunchPage }
								onUpgradeClick={ () => this.handleUpgradeClick( gridPlan.planSlug ) }
								planTitle={ gridPlan.planConstantObj.getTitle() }
								planSlug={ gridPlan.planSlug }
								flowName={ flowName }
								current={ gridPlan.current ?? false }
								currentSitePlanSlug={ currentSitePlanSlug }
								selectedSiteSlug={ selectedSiteSlug }
								planActionOverrides={ planActionOverrides }
								showMonthlyPrice={ true }
								siteId={ siteId }
								isStuck={ false }
								isLargeCurrency={ isLargeCurrency }
							/>
						</Container>

						{ /* RefundNotice */ }
						{ isAnyHostingFlow( flowName ) ? (
							<Container
								key={ gridPlan.planSlug }
								className="plan-features-2023-grid__table-item"
								isTableCell={ true }
							>
								{ ! isFreePlan( gridPlan.planSlug ) && (
									<div
										className={ `plan-features-2023-grid__refund-notice ${ getPlanClass(
											gridPlan.planSlug
										) }` }
									>
										{ translate( 'Refundable within %(dayCount)s days. No questions asked.', {
											args: {
												dayCount: gridPlan.pricing.billingPeriod === 365 ? 14 : 7,
											},
										} ) }
									</div>
								) }
							</Container>
						) : null }

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
							{ /* PreviousFeaturesIncludedTitle */ }
							<PreviousPlanFeaturesIncludedSection
								planSlug={ gridPlan.planSlug }
								gridPlansForFeaturesGrid={ this.props.gridPlansForFeaturesGrid }
								options={ { isTableCell: false } }
							/>

							{ /* PlanFeaturesList */ }
							<Container
								key={ gridPlan.planSlug }
								isTableCell={ false }
								className="plan-features-2023-grid__table-item"
							>
								<PlanFeatures2023GridFeatures
									features={ gridPlan.features.wpcomFeatures }
									planSlug={ gridPlan.planSlug }
									paidDomainName={ paidDomainName }
									wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
									hideUnavailableFeatures={ hideUnavailableFeatures }
									selectedFeature={ selectedFeature }
									isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
								/>
								{ gridPlan.features.jetpackFeatures.length !== 0 && (
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
									features={ gridPlan.features.jetpackFeatures }
									planSlug={ gridPlan.planSlug }
									paidDomainName={ paidDomainName }
									wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
									hideUnavailableFeatures={ hideUnavailableFeatures }
									isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
								/>
							</Container>

							<PlanStorageOptions
								storageOptions={ gridPlan.features.storageOptions }
								planSlug={ gridPlan.planSlug }
								intervalType={ intervalType }
								showUpgradeableStorage={ showUpgradeableStorage }
								options={ { isTableCell: false } }
							/>
						</CardContainer>
					</div>
				);
				return planCardJsx;
			} );
	}

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved inline
	 */
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

	/**
	 * @deprecated moved to own component
	 */
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
				<StorageAddOnDropdown planSlug={ planSlug } storageOptions={ storageOptions } />
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
			plansComparisonGridRef,
			toggleShowPlansComparisonGrid,
			showPlansComparisonGrid,
			isReskinned,
			isLargeCurrency,
			planActionOverrides,
			gridPlanForSpotlight,
			isPlanUpgradeCreditEligible,
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
					{ gridPlanForSpotlight && (
						<SpotlightPlans
							plansComparisonGridRef={ plansComparisonGridRef }
							manageHref={ manageHref }
							canUserPurchasePlan={ canUserPurchasePlan }
							isLaunchPage={ isLaunchPage }
							selectedSiteSlug={ selectedSiteSlug }
							flowName={ flowName }
							planActionOverrides={ planActionOverrides }
							gridPlanForSpotlight={ gridPlanForSpotlight }
							isInSignup={ isInSignup }
							isReskinned={ isReskinned }
							isLargeCurrency={ isLargeCurrency }
							isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
							currentSitePlanSlug={ currentSitePlanSlug }
							siteId={ siteId }
							onUpgradeClick={ () => this.handleUpgradeClick( gridPlanForSpotlight?.planSlug ) }
						/>
					) }
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
								isGlobalStylesOnPersonal={ isGlobalStylesOnPersonal }
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
