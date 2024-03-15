import { useRef } from '@wordpress/element';
import classnames from 'classnames';
import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlanButton from './components/shared/plan-button';
import PlanTypeSelector from './components/shared/plan-type-selector';
import { PlansTooltip } from './components/shared/plans-tooltip';
import PlansGridContextProvider from './grid-context';
import useGridPlanForSpotlight from './hooks/data-store/use-grid-plan-for-spotlight';
import useGridPlans from './hooks/data-store/use-grid-plans';
import useGridPlansForComparisonGrid from './hooks/data-store/use-grid-plans-for-comparison-grid';
import useGridPlansForFeaturesGrid from './hooks/data-store/use-grid-plans-for-features-grid';
import useGridSize from './hooks/use-grid-size';
import { useManageTooltipToggle } from './hooks/use-manage-tooltip-toggle';
import type { ComparisonGridExternalProps, FeaturesGridExternalProps } from './types';
import './style.scss';

const WrappedComparisonGrid = ( {
	selectedSiteId,
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	recordTracksEvent,
	allFeaturesList,
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
		coupon,
		isInAdmin,
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
	PlansTooltip,
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
};
