import {
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	type FeatureGroupSlug,
	FEATURE_GROUP_STORAGE,
} from '@automattic/calypso-products';
import { FoldableCard } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { useRef, useMemo } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PlansGridContextProvider, { usePlansGridContext } from '../../grid-context';
import useGridSize from '../../hooks/use-grid-size';
import { PlanFeaturesItem } from '../item';
import { PlanStorage } from '../shared/storage';
import BillingTimeframes from './billing-timeframes';
import EnterpriseFeatures from './enterprise-features';
import MobileFreeDomain from './mobile-free-domain';
import PlanFeaturesList from './plan-features-list';
import PlanHeaders from './plan-headers';
import PlanLogos from './plan-logos';
import PlanPrices from './plan-prices';
import PlanTagline from './plan-tagline';
import PreviousFeaturesIncludedTitle from './previous-features-included-title';
import SpotlightPlan from './spotlight-plan';
import Table from './table';
import TopButtons from './top-buttons';
import type {
	DataResponse,
	FeaturesGridExternalProps,
	FeaturesGridProps,
	GridPlan,
	PlanActionOverrides,
} from '../../types';

import './style.scss';

type MobileViewProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
	enableShowAllFeaturesButton?: boolean;
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

const FeaturesContainer = ( props: {
	children: ( featureGroupSlug: FeatureGroupSlug ) => JSX.Element;
	featureGroups: FeatureGroupSlug[];
	gridPlan: GridPlan;
} ) => {
	const { children, gridPlan, featureGroups } = props;
	const {
		enableCategorisedFeatures,
		enableLogosOnlyForEnterprisePlan,
		enableReducedFeatureGroupSpacing,
	} = usePlansGridContext();

	return (
		<>
			<EnterpriseFeatures
				renderedGridPlans={ [ gridPlan ] }
				options={ { isLogosOnly: enableLogosOnlyForEnterprisePlan } }
			/>
			{ ! enableCategorisedFeatures && (
				<PreviousFeaturesIncludedTitle renderedGridPlans={ [ gridPlan ] } />
			) }
			{ featureGroups.map( ( featureGroupSlug: FeatureGroupSlug ) => (
				<div
					className={ clsx( 'plans-grid-next-features-grid__feature-group-row', {
						'is-reduced-feature-group-spacing': enableReducedFeatureGroupSpacing,
					} ) }
					key={ featureGroupSlug }
				>
					{ children( featureGroupSlug ) }
				</div>
			) ) }
		</>
	);
};

const MobileView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	renderedGridPlans,
	hideUnavailableFeatures,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
	selectedFeature,
	showUpgradeableStorage,
	enableShowAllFeaturesButton,
}: MobileViewProps ) => {
	const translate = useTranslate();
	const { featureGroupMap } = usePlansGridContext();
	const featureGroups = useMemo(
		() =>
			Object.keys( featureGroupMap ).filter(
				( key ) => FEATURE_GROUP_STORAGE !== key
			) as FeatureGroupSlug[],
		[ featureGroupMap ]
	);
	const storageFeatureGroup = featureGroupMap[ FEATURE_GROUP_STORAGE ];

	return renderedGridPlans
		.reduce( ( acc, gridPlan ) => {
			// Bring the spotlight plan to the top
			if ( gridPlanForSpotlight?.planSlug === gridPlan.planSlug ) {
				return [ gridPlan ].concat( acc );
			}
			return acc.concat( gridPlan );
		}, [] as GridPlan[] )
		.map( ( gridPlan, index ) => {
			const planCardClasses = clsx(
				'plans-grid-next-features-grid__mobile-plan-card',
				getPlanClass( gridPlan.planSlug )
			);

			const isNotFreePlan = ! isFreePlan( gridPlan.planSlug );
			const isEnterprisePlan = isWpcomEnterpriseGridPlan( gridPlan.planSlug );
			const featuresEl = (
				<FeaturesContainer gridPlan={ gridPlan } featureGroups={ featureGroups }>
					{ ( featureGroupSlug: FeatureGroupSlug ) => (
						<PlanFeaturesList
							renderedGridPlans={ [ gridPlan ] }
							selectedFeature={ selectedFeature }
							paidDomainName={ paidDomainName }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							generatedWPComSubdomain={ generatedWPComSubdomain }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
							featureGroupSlug={ featureGroupSlug }
							onStorageAddOnClick={ onStorageAddOnClick }
							showUpgradeableStorage={ showUpgradeableStorage }
						/>
					) }
				</FeaturesContainer>
			);

			const planCardJsx = (
				<div className={ planCardClasses } key={ `${ gridPlan.planSlug }-${ index }` }>
					<PlanLogos renderedGridPlans={ [ gridPlan ] } isInSignup={ false } />
					<PlanHeaders renderedGridPlans={ [ gridPlan ] } />
					{ isNotFreePlan && isInSignup && <PlanTagline renderedGridPlans={ [ gridPlan ] } /> }
					{ isNotFreePlan && (
						<PlanPrices
							renderedGridPlans={ [ gridPlan ] }
							currentSitePlanSlug={ currentSitePlanSlug }
						/>
					) }
					{ isNotFreePlan && <BillingTimeframes renderedGridPlans={ [ gridPlan ] } /> }
					<MobileFreeDomain gridPlan={ gridPlan } paidDomainName={ paidDomainName } />
					{ storageFeatureGroup && ! isEnterprisePlan && (
						<>
							<PlanFeaturesItem>
								<h2 className="plans-grid-next-features-grid__feature-group-title">
									{ storageFeatureGroup?.getTitle() }
								</h2>
							</PlanFeaturesItem>
							<div className="plan-features-2023-grid__highlighted-feature">
								<PlanFeaturesItem>
									<PlanStorage
										planSlug={ gridPlan.planSlug }
										onStorageAddOnClick={ onStorageAddOnClick }
										showUpgradeableStorage={ showUpgradeableStorage }
									/>
								</PlanFeaturesItem>
							</div>
						</>
					) }
					<TopButtons
						renderedGridPlans={ [ gridPlan ] }
						isInSignup={ isInSignup }
						currentSitePlanSlug={ currentSitePlanSlug }
						planActionOverrides={ planActionOverrides }
					/>
					{ enableShowAllFeaturesButton ? (
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
							{ featuresEl }
						</CardContainer>
					) : (
						<div className="plans-grid-next-features-grid__mobile-plan-card-no-foldable-container">
							{ featuresEl }
						</div>
					) }
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
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
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
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
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
		isCustomDomainAllowedOnFreePlan,
		isInSignup,
		onStorageAddOnClick,
		paidDomainName,
		planActionOverrides,
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

// TODO
// Now that everything under is functional component, we can deprecate this wrapper and only keep ComparisonGrid instead.
// More details can be found in https://github.com/Automattic/wp-calypso/issues/87047
const FeaturesGrid = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	gridPlans,
	gridSize,
	hideUnavailableFeatures,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
	selectedFeature,
	showRefundPeriod,
	showUpgradeableStorage,
	stickyRowOffset,
	enableShowAllFeaturesButton,
}: FeaturesGridProps ) => {
	const spotlightPlanProps = {
		currentSitePlanSlug,
		gridPlanForSpotlight,
		isInSignup,
		onStorageAddOnClick,
		planActionOverrides,
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
								<MobileView
									{ ...planFeaturesProps }
									enableShowAllFeaturesButton={ enableShowAllFeaturesButton }
								/>
							</div>
						) }
					</div>
				</div>
			</div>
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
		enableStorageAsBadge,
		enableReducedFeatureGroupSpacing,
		enableLogosOnlyForEnterprisePlan,
		featureGroupMap = {},
		hideFeatureGroupTitles,
		enterpriseFeaturesList,
		enableTermSavingsPriceDisplay,
	} = props;

	const gridContainerRef = useRef< HTMLDivElement >( null );

	const gridBreakpoints = useMemo(
		() =>
			new Map( [
				[ 'small', 0 ],
				[ 'medium', 740 ],
				[ 'large', isInAdmin ? 1180 : 1320 ], // 1320 to fit Enterpreneur plan, 1180 to work in admin
			] ),
		[ isInAdmin ]
	);

	// TODO: this will be deprecated along side removing the wrapper component
	const gridSize = useGridSize( {
		containerRef: gridContainerRef,
		containerBreakpoints: gridBreakpoints,
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
				enableStorageAsBadge={ enableStorageAsBadge }
				enableReducedFeatureGroupSpacing={ enableReducedFeatureGroupSpacing }
				enableLogosOnlyForEnterprisePlan={ enableLogosOnlyForEnterprisePlan }
				hideFeatureGroupTitles={ hideFeatureGroupTitles }
				featureGroupMap={ featureGroupMap }
				enterpriseFeaturesList={ enterpriseFeaturesList }
				enableTermSavingsPriceDisplay={ enableTermSavingsPriceDisplay }
			>
				<FeaturesGrid { ...props } gridSize={ gridSize ?? undefined } />
			</PlansGridContextProvider>
		</div>
	);
};

export default WrappedFeaturesGrid;
