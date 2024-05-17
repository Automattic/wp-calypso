import {
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	type WPComStorageAddOnSlug,
	type FeatureGroupSlug,
} from '@automattic/calypso-products';
import { FoldableCard } from '@automattic/components';
import { useMemo } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import BillingTimeframes from './billing-timeframes';
import MobileFreeDomain from './mobile-free-domain';
import PartnerLogos from './partner-logos';
import PlanFeaturesList from './plan-features-list';
import PlanHeaders from './plan-headers';
import PlanLogos from './plan-logos';
import PlanPrice from './plan-price';
import PlanStorageOptions from './plan-storage-options';
import PlanTagline from './plan-tagline';
import PreviousFeaturesIncludedTitle from './previous-features-included-title';
import SpotlightPlan from './spotlight-plan';
import Table from './table';
import TopButtons from './top-buttons';
import type { DataResponse, FeaturesGridProps, GridPlan, PlanActionOverrides } from '../../types';

type MobileViewProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	intervalType: string;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
};

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

const MobileView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	renderedGridPlans,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showUpgradeableStorage,
}: MobileViewProps ) => {
	const translate = useTranslate();
	const { enableCategorisedFeatures, featureGroupMap } = usePlansGridContext();
	const featureGroups = useMemo(
		() =>
			enableCategorisedFeatures ? ( Object.keys( featureGroupMap ) as FeatureGroupSlug[] ) : [],
		[ enableCategorisedFeatures, featureGroupMap ]
	);

	return renderedGridPlans
		.reduce( ( acc, gridPlan ) => {
			// Bring the spotlight plan to the top
			if ( gridPlanForSpotlight?.planSlug === gridPlan.planSlug ) {
				return [ gridPlan ].concat( acc );
			}
			return acc.concat( gridPlan );
		}, [] as GridPlan[] )
		.map( ( gridPlan, index ) => {
			const planCardClasses = classNames(
				'plans-grid-next-features-grid__mobile-plan-card',
				getPlanClass( gridPlan.planSlug )
			);

			const isNotFreePlan = ! isFreePlan( gridPlan.planSlug );

			const planCardJsx = (
				<div className={ planCardClasses } key={ `${ gridPlan.planSlug }-${ index }` }>
					<PlanLogos renderedGridPlans={ [ gridPlan ] } isInSignup={ false } />
					<PlanHeaders renderedGridPlans={ [ gridPlan ] } />
					{ isNotFreePlan && isInSignup && <PlanTagline renderedGridPlans={ [ gridPlan ] } /> }
					{ isNotFreePlan && (
						<PlanPrice
							renderedGridPlans={ [ gridPlan ] }
							planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
							currentSitePlanSlug={ currentSitePlanSlug }
						/>
					) }
					{ isNotFreePlan && <BillingTimeframes renderedGridPlans={ [ gridPlan ] } /> }
					<MobileFreeDomain gridPlan={ gridPlan } paidDomainName={ paidDomainName } />
					<PlanStorageOptions
						renderedGridPlans={ [ gridPlan ] }
						intervalType={ intervalType }
						onStorageAddOnClick={ onStorageAddOnClick }
						showUpgradeableStorage={ showUpgradeableStorage }
					/>
					<TopButtons
						renderedGridPlans={ [ gridPlan ] }
						isInSignup={ isInSignup }
						currentSitePlanSlug={ currentSitePlanSlug }
						planActionOverrides={ planActionOverrides }
					/>
					<CardContainer
						header={ translate( 'Show all features' ) }
						planSlug={ gridPlan.planSlug }
						key={ `${ gridPlan.planSlug }-${ index }` }
						className="plans-grid-next-features-grid__mobile-plan-card-foldable-container"
						expanded={
							selectedFeature &&
							gridPlan.features.wpcomFeatures.some(
								( feature ) => feature.getSlug() === selectedFeature
							)
						}
					>
						<PartnerLogos renderedGridPlans={ [ gridPlan ] } />
						{ enableCategorisedFeatures ? (
							featureGroups.map( ( featureGroupSlug ) => (
								<div
									className="plans-grid-next-features-grid__feature-group-row"
									key={ featureGroupSlug }
								>
									<PlanFeaturesList
										renderedGridPlans={ [ gridPlan ] }
										selectedFeature={ selectedFeature }
										paidDomainName={ paidDomainName }
										hideUnavailableFeatures={ hideUnavailableFeatures }
										generatedWPComSubdomain={ generatedWPComSubdomain }
										isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
										featureGroupSlug={ featureGroupSlug }
									/>
								</div>
							) )
						) : (
							<>
								<PreviousFeaturesIncludedTitle renderedGridPlans={ [ gridPlan ] } />
								<PlanFeaturesList
									renderedGridPlans={ [ gridPlan ] }
									selectedFeature={ selectedFeature }
									paidDomainName={ paidDomainName }
									hideUnavailableFeatures={ hideUnavailableFeatures }
									generatedWPComSubdomain={ generatedWPComSubdomain }
									isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
								/>
							</>
						) }
					</CardContainer>
				</div>
			);
			return planCardJsx;
		} );
};

type TabletViewProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	intervalType: string;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showRefundPeriod?: boolean;
	showUpgradeableStorage: boolean;
	stickyRowOffset: number;
};

const TabletView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	renderedGridPlans,
	selectedFeature,
	showRefundPeriod,
	showUpgradeableStorage,
	stickyRowOffset,
}: TabletViewProps ) => {
	const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
		? renderedGridPlans
		: renderedGridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
	const numberOfPlansToShowOnTop = 4 === gridPlansWithoutSpotlight.length ? 2 : 3;
	const plansForTopRow = gridPlansWithoutSpotlight.slice( 0, numberOfPlansToShowOnTop );
	const plansForBottomRow = gridPlansWithoutSpotlight.slice( numberOfPlansToShowOnTop );
	const tableProps = {
		currentSitePlanSlug,
		generatedWPComSubdomain,
		gridPlanForSpotlight,
		hideUnavailableFeatures,
		intervalType,
		isCustomDomainAllowedOnFreePlan,
		isInSignup,
		onStorageAddOnClick,
		paidDomainName,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showRefundPeriod,
		showUpgradeableStorage,
		stickyRowOffset,
	};

	return (
		<>
			<div className="plan-features-2023-grid__table-top">
				<Table renderedGridPlans={ plansForTopRow } { ...tableProps } />
			</div>
			{ plansForBottomRow.length > 0 && (
				<div className="plan-features-2023-grid__table-bottom">
					<Table renderedGridPlans={ plansForBottomRow } { ...tableProps } />
				</div>
			) }
		</>
	);
};

const FeaturesGrid = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	gridPlans,
	gridSize,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showRefundPeriod,
	showUpgradeableStorage,
	stickyRowOffset,
}: FeaturesGridProps ) => {
	const spotlightPlanProps = {
		currentSitePlanSlug,
		gridPlanForSpotlight,
		intervalType,
		isInSignup,
		onStorageAddOnClick,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showUpgradeableStorage,
	};

	const planFeaturesProps = {
		...spotlightPlanProps,
		generatedWPComSubdomain,
		hideUnavailableFeatures,
		isCustomDomainAllowedOnFreePlan,
		paidDomainName,
		renderedGridPlans: gridPlans,
		showRefundPeriod,
	};

	return (
		<div className="plans-grid-next-features-grid">
			{ 'small' !== gridSize && <SpotlightPlan { ...spotlightPlanProps } /> }
			<div className="plan-features">
				<div className="plan-features-2023-grid__content">
					<div>
						{ 'large' === gridSize && (
							<div className="plan-features-2023-grid__desktop-view">
								<Table { ...planFeaturesProps } stickyRowOffset={ stickyRowOffset } />
							</div>
						) }
						{ 'medium' === gridSize && (
							<div className="plan-features-2023-grid__tablet-view">
								<TabletView { ...planFeaturesProps } stickyRowOffset={ stickyRowOffset } />
							</div>
						) }
						{ 'small' === gridSize && (
							<div className="plan-features-2023-grid__mobile-view">
								<MobileView { ...planFeaturesProps } />
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeaturesGrid;
