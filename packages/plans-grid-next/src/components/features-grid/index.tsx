import {
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	WPComStorageAddOnSlug,
	PlanSlug,
} from '@automattic/calypso-products';
import { FoldableCard } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import useGridPlanForSpotlight from '../../hooks/data-store/use-grid-plan-for-spotlight';
import useUpgradeClickHandler from '../../hooks/use-upgrade-click-handler';
import BillingTimeframes from './billing-timeframes';
import MobileFreeDomain from './mobile-free-domain';
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
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
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
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showUpgradeableStorage,
}: MobileViewProps ) => {
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
	const translate = useTranslate();

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
				'plan-features-2023-grid__mobile-plan-card',
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
						isLaunchPage={ isLaunchPage }
						currentSitePlanSlug={ currentSitePlanSlug }
						planActionOverrides={ planActionOverrides }
						onUpgradeClick={ onUpgradeClick }
					/>
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
						<PreviousFeaturesIncludedTitle renderedGridPlans={ [ gridPlan ] } />
						<PlanFeaturesList
							renderedGridPlans={ [ gridPlan ] }
							selectedFeature={ selectedFeature }
							paidDomainName={ paidDomainName }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							generatedWPComSubdomain={ generatedWPComSubdomain }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						/>
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
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
	stickyRowOffset: number;
};

const TabletView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	renderedGridPlans,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
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
		isLaunchPage,
		onStorageAddOnClick,
		onUpgradeClick,
		paidDomainName,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
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
	gridPlans,
	stickyRowOffset,
	isInSignup,
	planUpgradeCreditsApplicable,
	currentSitePlanSlug,
	isLaunchPage,
	planActionOverrides,
	onUpgradeClick,
	intervalType,
	onStorageAddOnClick,
	showUpgradeableStorage,
	paidDomainName,
	hideUnavailableFeatures,
	selectedFeature,
	generatedWPComSubdomain,
	isCustomDomainAllowedOnFreePlan,
	gridSize,
	isSpotlightOnCurrentPlan,
	intent,
}: FeaturesGridProps ) => {
	const handleUpgradeClick = useUpgradeClickHandler( {
		gridPlans,
		onUpgradeClick,
	} );

	const gridPlanForSpotlight = useGridPlanForSpotlight( {
		intent,
		isSpotlightOnCurrentPlan,
		plansForFeaturesGrid: gridPlans,
		sitePlanSlug: currentSitePlanSlug,
	} );

	const spotlightPlanProps = {
		currentSitePlanSlug,
		gridPlanForSpotlight,
		intervalType,
		isInSignup,
		isLaunchPage,
		onStorageAddOnClick,
		onUpgradeClick: handleUpgradeClick,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showUpgradeableStorage,
	};

	const planFeaturesProps = {
		...spotlightPlanProps,
		generatedWPComSubdomain,
		renderedGridPlans: gridPlans,
		hideUnavailableFeatures,
		isCustomDomainAllowedOnFreePlan,
		paidDomainName,
	};

	return (
		<>
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
		</>
	);
};

export default FeaturesGrid;
