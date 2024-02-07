import { useRef } from '@wordpress/element';
import classnames from 'classnames';
import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlanButton from './components/plan-button';
import PlanTypeSelector from './components/plan-type-selector';
import { Plans2023Tooltip } from './components/plans-2023-tooltip';
import PlansGridContextProvider from './grid-context';
import useGridPlans from './hooks/data-store/use-grid-plans';
import usePlanFeaturesForGridPlans from './hooks/data-store/use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from './hooks/data-store/use-restructured-plan-features-for-comparison-grid';
import useGridSize from './hooks/use-grid-size';
import { useManageTooltipToggle } from './hooks/use-manage-tooltip-toggle';
import useUpgradeClickHandler from './hooks/use-upgrade-click-handler';
import type { ComparisonGridExternalProps, FeaturesGridExternalProps } from './types';
import './style.scss';

const WrappedComparisonGrid = ( {
	selectedSiteId,
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	recordTracksEvent,
	allFeaturesList,
	onUpgradeClick,
	intervalType,
	isInSignup,
	isLaunchPage,
	currentSitePlanSlug,
	selectedPlan,
	selectedFeature,
	showUpgradeableStorage,
	onStorageAddOnClick,
	stickyRowOffset,
	coupon,
	...otherProps
}: ComparisonGridExternalProps ) => {
	const handleUpgradeClick = useUpgradeClickHandler( {
		gridPlans,
		onUpgradeClick,
	} );

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

	const classNames = classnames( 'plans-grid-next', 'plans-grid-next__comparison-grid', {
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
				selectedSiteId={ selectedSiteId }
				gridPlans={ gridPlans }
				useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
				recordTracksEvent={ recordTracksEvent }
				allFeaturesList={ allFeaturesList }
				coupon={ coupon }
			>
				<ComparisonGrid
					intervalType={ intervalType }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					currentSitePlanSlug={ currentSitePlanSlug }
					onUpgradeClick={ handleUpgradeClick }
					selectedSiteId={ selectedSiteId }
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
		selectedSiteId,
		intent,
		gridPlans,
		useCheckPlanAvailabilityForPurchase,
		recordTracksEvent,
		allFeaturesList,
		onUpgradeClick,
		coupon,
		isInAdmin,
	} = props;
	const handleUpgradeClick = useUpgradeClickHandler( {
		gridPlans,
		onUpgradeClick,
	} );

	const gridContainerRef = useRef< HTMLDivElement | null >( null );
	const gridSize = useGridSize( {
		containerRef: gridContainerRef,
		containerBreakpoints: new Map( [
			[ 'small', 0 ],
			[ 'medium', 740 ],
			[ 'large', isInAdmin ? 1180 : 1320 ], // 1320 to fit Enterpreneur plan, 1180 to work in admin
		] ),
	} );

	const classNames = classnames( 'plans-grid-next', 'plans-grid-next__features-grid', {
		'is-small': 'small' === gridSize,
		'is-medium': 'medium' === gridSize,
		'is-large': 'large' === gridSize,
		'is-visible': true,
	} );

	return (
		<div ref={ gridContainerRef } className={ classNames }>
			<PlansGridContextProvider
				intent={ intent }
				selectedSiteId={ selectedSiteId }
				gridPlans={ gridPlans }
				coupon={ coupon }
				useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
				recordTracksEvent={ recordTracksEvent }
				allFeaturesList={ allFeaturesList }
			>
				<FeaturesGrid
					{ ...props }
					onUpgradeClick={ handleUpgradeClick }
					gridSize={ gridSize ?? undefined }
				/>
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
	usePlanFeaturesForGridPlans,
	useRestructuredPlanFeaturesForComparisonGrid,
};
