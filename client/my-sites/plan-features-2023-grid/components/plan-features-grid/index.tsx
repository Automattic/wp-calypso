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
import classNames from 'classnames';
import { type LocalizeProps, useTranslate } from 'i18n-calypso';
import { Component, createRef } from 'react';
import FoldableCard from 'calypso/components/foldable-card';
import { usePlansGridContext } from '../../grid-context';
import useHighlightAdjacencyMatrix from '../../hooks/npm-ready/use-highlight-adjacency-matrix';
import { getStorageStringFromFeature } from '../../util';
import PlanFeatures2023GridActions from '../actions';
import PlanFeatures2023GridBillingTimeframe from '../billing-timeframe';
import PlanFeatures2023GridFeatures from '../features';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import { PlanFeaturesItem } from '../item';
import { Plans2023Tooltip } from '../plans-2023-tooltip';
import PopularBadge from '../popular-badge';
import { StickyContainer } from '../sticky-container';
import StorageAddOnDropdown from '../storage-add-on-dropdown';
import type { GridPlan } from '../../hooks/npm-ready/data-store/use-grid-plans';
import type { PlanFeaturesGridProps } from '../../types';
import '../../style.scss';

type PlanRowOptions = {
	isTableCell?: boolean;
	isStuck?: boolean;
};

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

// TODO clk: These `Internal...` props should gradually be factored out as more dependencies are moved to plans-features-main
export interface InternalPlanFeaturesGridProps
	extends Omit< PlanFeaturesGridProps, 'onUpgradeClick' > {
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	canUserPurchasePlan: boolean | null;
	manageHref: string;
	selectedSiteSlug: string | null;
	isLargeCurrency: boolean;
	translate: LocalizeProps[ 'translate' ];
	isPlanUpgradeCreditEligible: boolean;
}

export class FunkyHtmlTableOrCards extends Component< InternalPlanFeaturesGridProps > {
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
		const { gridPlans, gridPlanForSpotlight } = this.props;
		const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
			? gridPlans
			: gridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
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
		const { translate, selectedFeature, gridPlans, gridPlanForSpotlight } = this.props;
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

		return gridPlans
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
		return renderedGridPlans.map( ( { planSlug } ) => {
			const classes = classNames(
				'plan-features-2023-grid__table-item',
				'plan-features-2023-grid__header-billing-info'
			);

			return (
				<Container className={ classes } isTableCell={ options?.isTableCell } key={ planSlug }>
					<PlanFeatures2023GridBillingTimeframe planSlug={ planSlug } />
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
		return renderedGridPlans.map( ( { planSlug, planTitle } ) => {
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
						<h4 className="plan-features-2023-grid__header-title">{ planTitle }</h4>
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
			onUpgradeClick,
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
						onUpgradeClick={ () => onUpgradeClick( planSlug ) }
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
				</Container>
			);
		} );
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
		const { translate, gridPlans } = this.props;

		return renderedGridPlans.map( ( { planSlug } ) => {
			const shouldRenderEnterpriseLogos =
				isWpcomEnterpriseGridPlan( planSlug ) || isWooExpressPlusPlan( planSlug );
			const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug ) && ! shouldRenderEnterpriseLogos;
			const indexInGridPlans = gridPlans.findIndex( ( { planSlug: slug } ) => slug === planSlug );
			const previousProductName =
				indexInGridPlans > 0 ? gridPlans[ indexInGridPlans - 1 ].productNameShort : null;
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
		const { gridPlans } = this.props;

		return (
			<div>
				{ this.renderSpotlightPlan() }
				<div className="plan-features">
					<div className="plan-features-2023-grid__content">
						<div>
							<div className="plan-features-2023-grid__desktop-view">
								{ this.renderTable( gridPlans ) }
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
}

export default FunkyHtmlTableOrCards;
