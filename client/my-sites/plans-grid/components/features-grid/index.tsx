import {
	getPlanClass,
	isFreePlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
	PlanSlug,
	isWooExpressPlusPlan,
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
	FoldableCard,
} from '@automattic/components';
import classNames from 'classnames';
import { LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { getStorageStringFromFeature } from '../../util';
import PlanFeatures2023GridActions from '../actions';
import PlanFeatures2023GridBillingTimeframe from '../billing-timeframe';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import { PlanFeaturesItem } from '../item';
import PlanDivOrTdContainer from '../plan-div-td-container';
import PlanFeaturesContainer from '../plan-features-container';
import PlanLogo from '../plan-logo';
import { StickyContainer } from '../sticky-container';
import StorageAddOnDropdown from '../storage-add-on-dropdown';
import type { PlansGridProps } from '../..';
import type { GridPlan } from '../../hooks/npm-ready/data-store/use-grid-plans';

type PlanRowOptions = {
	isTableCell?: boolean;
	isStuck?: boolean;
};

interface FeaturesGridType extends PlansGridProps {
	isLargeCurrency: boolean;
	translate: LocalizeProps[ 'translate' ];
	canUserManageCurrentPlan?: boolean | null;
	currentPlanManageHref?: string;
	isPlanUpgradeCreditEligible: boolean;
	handleUpgradeClick: ( planSlug: PlanSlug ) => void;
}

class FeaturesGrid extends Component< FeaturesGridType > {
	renderTable( renderedGridPlans: GridPlan[] ) {
		const { translate, gridPlanForSpotlight, stickyRowOffset } = this.props;
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
					>
						{ ( isStuck: boolean ) =>
							this.renderTopButtons( gridPlansWithoutSpotlight, { isTableCell: true, isStuck } )
						}
					</StickyContainer>
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
					{ this.renderPlanStorageOptions( [ gridPlanForSpotlight ] ) }
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
						{ this.renderPlanStorageOptions( [ gridPlan ] ) }
						{ this.renderTopButtons( [ gridPlan ] ) }
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
		const { isLargeCurrency, translate, isPlanUpgradeCreditEligible, currentSitePlanSlug, siteId } =
			this.props;
		return renderedGridPlans.map( ( { planSlug } ) => {
			const isWooExpressPlus = isWooExpressPlusPlan( planSlug );

			return (
				<PlanDivOrTdContainer
					scope="col"
					key={ planSlug }
					className="plan-features-2023-grid__table-item plan-price"
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
					<PlanFeatures2023GridBillingTimeframe
						planSlug={ planSlug }
						showRefundPeriod={ this.props.showRefundPeriod }
					/>
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

	renderTopButtons( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const {
			isInSignup,
			isLaunchPage,
			flowName,
			canUserManageCurrentPlan,
			currentPlanManageHref,
			currentSitePlanSlug,
			translate,
			planActionOverrides,
			siteId,
			isLargeCurrency,
			handleUpgradeClick,
		} = this.props;

		return renderedGridPlans.map(
			( { planSlug, availableForPurchase, isMonthlyPlan, features: { storageOptions } } ) => {
				const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

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
							currentPlanManageHref={ currentPlanManageHref }
							canUserManageCurrentPlan={ canUserManageCurrentPlan }
							availableForPurchase={ availableForPurchase }
							className={ getPlanClass( planSlug ) }
							freePlan={ isFreePlan( planSlug ) }
							isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planSlug ) }
							isWooExpressPlusPlan={ isWooExpressPlusPlan( planSlug ) }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							isMonthlyPlan={ isMonthlyPlan }
							onUpgradeClick={ ( overridePlanSlug ) =>
								handleUpgradeClick( overridePlanSlug ?? planSlug )
							}
							planSlug={ planSlug }
							flowName={ flowName }
							currentSitePlanSlug={ currentSitePlanSlug }
							buttonText={ buttonText }
							planActionOverrides={ planActionOverrides }
							showMonthlyPrice={ true }
							siteId={ siteId }
							isStuck={ options?.isStuck || false }
							isLargeCurrency={ isLargeCurrency }
							storageOptions={ storageOptions }
						/>
					</PlanDivOrTdContainer>
				);
			}
		);
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
			const indexInGridPlansForFeaturesGrid = gridPlans.findIndex(
				( { planSlug: slug } ) => slug === planSlug
			);
			const previousProductName =
				indexInGridPlansForFeaturesGrid > 0
					? gridPlans[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
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
			generatedWPComSubdomain,
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
				generatedWPComSubdomain={ generatedWPComSubdomain }
				translate={ translate }
				hideUnavailableFeatures={ hideUnavailableFeatures }
				selectedFeature={ selectedFeature }
				isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
				isTableCell={ options?.isTableCell }
			/>
		);
	}

	renderPlanStorageOptions( renderedGridPlans: GridPlan[], options?: PlanRowOptions ) {
		const {
			translate,
			intervalType,
			isInSignup,
			flowName,
			onStorageAddOnClick,
			showUpgradeableStorage,
		} = this.props;

		return renderedGridPlans.map( ( { planSlug, features: { storageOptions } } ) => {
			if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
				return null;
			}

			const shouldRenderStorageTitle =
				storageOptions.length > 0 &&
				( storageOptions.length === 1 ||
					intervalType !== 'yearly' ||
					! showUpgradeableStorage ||
					( isInSignup && ! ( flowName === 'onboarding' ) ) );

			const canUpgradeStorageForPlan = isStorageUpgradeableForPlan( {
				flowName: flowName ?? '',
				intervalType,
				isInSignup,
				showUpgradeableStorage,
				storageOptions,
			} );
			const storageJSX = canUpgradeStorageForPlan ? (
				<StorageAddOnDropdown
					label={ translate( 'Storage' ) }
					planSlug={ planSlug }
					onStorageAddOnClick={ onStorageAddOnClick }
					storageOptions={ storageOptions }
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
		const { gridPlans } = this.props;

		return (
			<>
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
			</>
		);
	}
}

export default FeaturesGrid;
