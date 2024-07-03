import { useRef } from '@wordpress/element';
import clsx from 'clsx';
import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlanButton from './components/plan-button';
import PlanTypeSelector from './components/plan-type-selector';
import { Plans2023Tooltip } from './components/plans-2023-tooltip';
import PlansGridContextProvider from './grid-context';
import useGridPlanForSpotlight from './hooks/data-store/use-grid-plan-for-spotlight';
import useGridPlans from './hooks/data-store/use-grid-plans';
import useGridPlansForComparisonGrid from './hooks/data-store/use-grid-plans-for-comparison-grid';
import useGridPlansForFeaturesGrid from './hooks/data-store/use-grid-plans-for-features-grid';
import usePlanBillingDescription from './hooks/data-store/use-plan-billing-description';
import usePlanFeaturesForGridPlans from './hooks/data-store/use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from './hooks/data-store/use-restructured-plan-features-for-comparison-grid';
import useGridSize from './hooks/use-grid-size';
import { useManageTooltipToggle } from './hooks/use-manage-tooltip-toggle';
import type { ComparisonGridExternalProps, FeaturesGridExternalProps } from './types';
import './style.scss';

const WrappedComparisonGrid = ( {
	siteId,
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	useAction,
	recordTracksEvent,
	allFeaturesList,
	intervalType,
	isInSignup,
	currentSitePlanSlug,
	selectedPlan,
	selectedFeature,
	showUpgradeableStorage,
	onStorageAddOnClick,
	stickyRowOffset,
	coupon,
	className,
	hideUnsupportedFeatures,
	enableFeatureTooltips,
	featureGroupMap,
	...otherProps
}: ComparisonGridExternalProps ) => {
	const gridContainerRef = useRef< HTMLDivElement | null >( null );
	const gridSize = useGridSize( {
		containerRef: gridContainerRef,
		containerBreakpoints: new Map( [
			[ 'small', 0 ],
			[ 'smedium', 686 ],
			[ 'medium', 835 ], // enough to fit Enterpreneur plan. was 686
			[ 'large', 1005 ], // enough to fit Enterpreneur plan. was 870
			[ 'xlarge', 1180 ],
		] ),
	} );

	const classNames = clsx( 'plans-grid-next', className, {
		'is-small': 'small' === gridSize,
		'is-smedium': 'smedium' === gridSize,
		'is-medium': 'medium' === gridSize,
		'is-large': 'large' === gridSize,
		'is-xlarge': 'xlarge' === gridSize,
		'is-visible': true,
	} );

	return (
		<div ref={ gridContainerRef } className={ classNames }>
			<PlansGridContextProvider
				intent={ intent }
				siteId={ siteId }
				gridPlans={ gridPlans }
				useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
				useAction={ useAction }
				recordTracksEvent={ recordTracksEvent }
				allFeaturesList={ allFeaturesList }
				coupon={ coupon }
				enableFeatureTooltips={ enableFeatureTooltips }
				featureGroupMap={ featureGroupMap }
				hideUnsupportedFeatures={ hideUnsupportedFeatures }
			>
				<ComparisonGrid
					intervalType={ intervalType }
					isInSignup={ isInSignup }
					currentSitePlanSlug={ currentSitePlanSlug }
					siteId={ siteId }
					selectedPlan={ selectedPlan }
					selectedFeature={ selectedFeature }
					showUpgradeableStorage={ showUpgradeableStorage }
					stickyRowOffset={ stickyRowOffset }
					onStorageAddOnClick={ onStorageAddOnClick }
					gridSize={ gridSize ?? undefined }
					{ ...otherProps }
				/>
			</PlansGridContextProvider>
		</div>
	);
};

const WrappedFeaturesGrid = ( props: FeaturesGridExternalProps ) => {
	const {
		siteId,
		intent,
		gridPlans,
		useCheckPlanAvailabilityForPurchase,
		useAction,
		recordTracksEvent,
		allFeaturesList,
		coupon,
		isInAdmin,
		className,
		enableFeatureTooltips,
		enableCategorisedFeatures,
		featureGroupMap = {},
	} = props;

	const gridContainerRef = useRef< HTMLDivElement | null >( null );
	const gridSize = useGridSize( {
		containerRef: gridContainerRef,
		containerBreakpoints: new Map( [
			[ 'small', 0 ],
			[ 'medium', 740 ],
			[ 'large', isInAdmin ? 1180 : 1320 ], // 1320 to fit Enterpreneur plan, 1180 to work in admin
		] ),
	} );

	const classNames = clsx( 'plans-grid-next', className, {
		'is-small': 'small' === gridSize,
		'is-medium': 'medium' === gridSize,
		'is-large': 'large' === gridSize,
	} );

	return (
		<div ref={ gridContainerRef } className={ classNames }>
			<PlansGridContextProvider
				intent={ intent }
				siteId={ siteId }
				gridPlans={ gridPlans }
				coupon={ coupon }
				useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
				useAction={ useAction }
				recordTracksEvent={ recordTracksEvent }
				allFeaturesList={ allFeaturesList }
				enableFeatureTooltips={ enableFeatureTooltips }
				enableCategorisedFeatures={ enableCategorisedFeatures }
				featureGroupMap={ featureGroupMap }
			>
				<FeaturesGrid { ...props } gridSize={ gridSize ?? undefined } />
			</PlansGridContextProvider>
		</div>
	);
};

/**
 * Types
 */
export type * from './types';

/**
 * Components
 */
export {
	WrappedComparisonGrid as ComparisonGrid,
	WrappedFeaturesGrid as FeaturesGrid,
	PlanTypeSelector,
	PlanButton,
	Plans2023Tooltip,
};

/**
 * Hooks/helpers
 */
export {
	useManageTooltipToggle,
	useGridPlans,
	useGridPlansForFeaturesGrid,
	useGridPlansForComparisonGrid,
	useGridPlanForSpotlight,
	usePlanBillingDescription,
	usePlanFeaturesForGridPlans,
	useRestructuredPlanFeaturesForComparisonGrid,
};
