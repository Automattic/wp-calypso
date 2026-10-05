import { useMobileBreakpoint, useDesktopBreakpoint } from '@automattic/viewport-react';
import { RadioControl, TabPanel } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import useSliderPersistence from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-slider-persistence';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	FILTER_TYPE_INSTALL,
	FILTER_TYPE_VISITS,
	PLAN_CATEGORY_LEGACY_STANDARD,
	PLAN_CATEGORY_LEGACY_ENTERPRISE,
	FILTER_TYPE_STORAGE,
	PLAN_CATEGORY_STANDARD_TIER,
	PLAN_CATEGORY_AGENCY_TIER,
	PLAN_CATEGORY_PERFORMANCE_TIER,
} from '../constants';
import getNormalizedSliderSelection from '../lib/get-normalized-slider-selection';
import getPressablePlan, { PressablePlan } from '../lib/get-pressable-plan';
import getSliderOptions from '../lib/get-slider-options';
import { FilterType } from '../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	// Plan details for the plan that's currently selected in the UI
	selectedPlan: APIProductFamilyProduct | null;
	// All available Pressable plans
	plans: APIProductFamilyProduct[];
	// The users existing Pressable plan if any
	pressablePlan?: PressablePlan | null;
	// Plan selection handler
	onSelectPlan: ( plan: APIProductFamilyProduct | null ) => void;
	// Whether the existing plan is still being loaded
	isLoading?: boolean;
	isCurrentCatalog?: boolean;
	selectedTab: string;
	setSelectedTab: ( tab: string ) => void;
	isReferralMode: boolean;
};

export default function PlanSelectionFilter( {
	selectedPlan,
	plans,
	onSelectPlan,
	pressablePlan,
	isLoading,
	isCurrentCatalog: isCurrentCatalog = false,
	selectedTab,
	setSelectedTab,
	isReferralMode,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ filterType, setFilterType ] = useSliderPersistence< FilterType >( {
		key: 'pressable-filter-type',
		defaultValue: FILTER_TYPE_INSTALL,
	} );
	const [ isStandardTabDisabled, setIsStandardTabDisabled ] = useState( false );

	const isMobile = useMobileBreakpoint();
	const isDesktop = useDesktopBreakpoint();

	const isPerformanceTab = selectedTab === PLAN_CATEGORY_PERFORMANCE_TIER;

	// Currently, we only want the Performance plans for referral mode
	const canReferPerformancePlans =
		isReferralMode && plans.some( ( plan ) => plan.slug.startsWith( 'pressable-premium-' ) );

	const standardTabOptions = useMemo(
		() =>
			getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) ),
				isCurrentCatalog ? PLAN_CATEGORY_STANDARD_TIER : PLAN_CATEGORY_LEGACY_STANDARD,
				isMobile
			),
		[ filterType, isMobile, plans, isCurrentCatalog ]
	);

	const agencyTabOptions = useMemo(
		() => [
			...getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) ),
				isCurrentCatalog ? PLAN_CATEGORY_AGENCY_TIER : PLAN_CATEGORY_LEGACY_ENTERPRISE,
				isMobile
			),
			...( isPerformanceTab
				? []
				: [
						{
							label: translate( 'More' ),
							value: null,
							category: null,
						},
					] ),
		],
		[ filterType, isMobile, plans, isPerformanceTab, translate, isCurrentCatalog ]
	);

	const performanceTabOptions = useMemo(
		() => [
			...getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) ),
				PLAN_CATEGORY_PERFORMANCE_TIER,
				isMobile
			),
			{
				label: translate( 'More' ),
				value: null,
				category: null,
			},
		],
		[ filterType, isMobile, plans, translate ]
	);

	const onSelectOption = useCallback(
		( option: Option ) => {
			const plan = plans.find( ( plan ) => plan.slug === option.value ) ?? null;
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_select_plan', {
					slug: plan?.slug,
				} )
			);
			onSelectPlan( plan );
		},
		[ dispatch, onSelectPlan, plans ]
	);

	const selectedOptions = useMemo( (): Option[] => {
		switch ( selectedTab ) {
			case PLAN_CATEGORY_LEGACY_STANDARD:
			case PLAN_CATEGORY_STANDARD_TIER:
				return standardTabOptions;
			case PLAN_CATEGORY_LEGACY_ENTERPRISE:
			case PLAN_CATEGORY_AGENCY_TIER:
				return agencyTabOptions;
			case PLAN_CATEGORY_PERFORMANCE_TIER:
				return performanceTabOptions;
			default:
				return [];
		}
	}, [ selectedTab, standardTabOptions, agencyTabOptions, performanceTabOptions ] );

	const selectedOptionIndex = useMemo( () => {
		return selectedOptions.findIndex(
			( { value } ) => value === ( selectedPlan ? selectedPlan.slug : null )
		);
	}, [ selectedOptions, selectedPlan ] );

	const onSelectFilterType = useCallback(
		( value: FilterType ) => {
			setFilterType( value );
			dispatch(
				recordTracksEvent( `calypso_a4a_marketplace_hosting_pressable_filter_by_${ value }_click` )
			);
		},
		[ dispatch, setFilterType ]
	);

	const onSelectTab = useCallback(
		( tab: string ) => {
			setSelectedTab( tab );

			if (
				canReferPerformancePlans &&
				tab === PLAN_CATEGORY_PERFORMANCE_TIER &&
				filterType === FILTER_TYPE_INSTALL
			) {
				setFilterType( FILTER_TYPE_VISITS );
			}
		},
		[ filterType, canReferPerformancePlans, setSelectedTab, setFilterType ]
	);

	const additionalWrapperClass =
		filterType === FILTER_TYPE_INSTALL
			? 'a4a-pressable-filter-wrapper-install'
			: 'a4a-pressable-filter-wrapper-visits';
	const wrapperClass = clsx( additionalWrapperClass, 'pressable-overview-plan-selection__filter' );

	const getSliderMinimum = useCallback(
		( category: string, categoryOptions: Option[] ) => {
			if ( ! pressablePlan ) {
				return 0;
			}

			// Depending on the category of the existing plan, we might want to show other category slider at the most min or max
			const isStandardCategory =
				PLAN_CATEGORY_LEGACY_STANDARD === category || PLAN_CATEGORY_STANDARD_TIER === category;
			const isEnterpriseCategory =
				PLAN_CATEGORY_LEGACY_ENTERPRISE === category || PLAN_CATEGORY_AGENCY_TIER === category;
			const isPlanStandardCategory =
				PLAN_CATEGORY_LEGACY_STANDARD === pressablePlan?.category ||
				PLAN_CATEGORY_STANDARD_TIER === pressablePlan?.category;
			const isPlanEnterpriseCategory =
				PLAN_CATEGORY_LEGACY_ENTERPRISE === pressablePlan?.category ||
				PLAN_CATEGORY_AGENCY_TIER === pressablePlan?.category;
			const isPlanPremiumCategory = PLAN_CATEGORY_PERFORMANCE_TIER === pressablePlan?.category;

			if ( isStandardCategory && ! isPlanStandardCategory ) {
				return categoryOptions.length - 1;
			} else if ( isEnterpriseCategory && ! isPlanEnterpriseCategory ) {
				return 0;
			}

			if ( isPlanPremiumCategory ) {
				for ( let i = 0; i < categoryOptions.length; i++ ) {
					const plan = getPressablePlan( categoryOptions[ i ].value as string );
					if ( pressablePlan?.storage < plan?.storage ) {
						return i;
					}
				}
			}

			for ( let i = 0; i < categoryOptions.length; i++ ) {
				const plan = getPressablePlan( categoryOptions[ i ].value as string );
				if ( pressablePlan?.install < plan?.install ) {
					return i;
				}
			}
			return categoryOptions.length;
		},
		[ pressablePlan ]
	);

	useEffect( () => {
		const normalizedIndex = getNormalizedSliderSelection(
			selectedOptionIndex,
			getSliderMinimum( selectedTab, selectedOptions ),
			selectedOptions.length
		);

		if ( normalizedIndex === selectedOptionIndex ) {
			return;
		}

		const normalizedSlug = selectedOptions[ normalizedIndex ]?.value;
		const normalizedPlan = plans.find( ( plan ) => plan.slug === normalizedSlug ) ?? null;
		onSelectPlan( normalizedPlan );
	}, [ getSliderMinimum, onSelectPlan, plans, selectedOptionIndex, selectedOptions, selectedTab ] );

	useEffect( () => {
		// Ensure standard tab is not disabled if no existing plan
		if ( ! pressablePlan ) {
			setIsStandardTabDisabled( false );
			return;
		}

		// Disable the standard tab if the existing plan is the highest standard plan or higher
		const isStandardCategory =
			pressablePlan.category === PLAN_CATEGORY_LEGACY_STANDARD ||
			pressablePlan.category === PLAN_CATEGORY_STANDARD_TIER;
		if (
			! isStandardCategory ||
			pressablePlan.slug === standardTabOptions[ standardTabOptions.length - 1 ]?.value
		) {
			setIsStandardTabDisabled( true );
		} else {
			setIsStandardTabDisabled( false );
		}
	}, [ pressablePlan, standardTabOptions, isCurrentCatalog ] );

	const tabs = useMemo(
		() => [
			...( isCurrentCatalog
				? [
						{
							name: PLAN_CATEGORY_STANDARD_TIER,
							title: isDesktop ? translate( 'Standard plans' ) : translate( 'Standard' ),
							disabled: isStandardTabDisabled,
						},
						{
							name: PLAN_CATEGORY_AGENCY_TIER,
							title: isDesktop ? translate( 'Agency plans' ) : translate( 'Agency' ),
						},
					]
				: [
						{
							name: PLAN_CATEGORY_LEGACY_STANDARD,
							title: isDesktop ? translate( 'Signature plans' ) : translate( 'Signature' ),
							disabled: isStandardTabDisabled,
						},
						{
							name: PLAN_CATEGORY_LEGACY_ENTERPRISE,
							title: isDesktop ? translate( 'Enterprise plans' ) : translate( 'Enterprise' ),
						},
					] ),
			{
				name: PLAN_CATEGORY_PERFORMANCE_TIER,
				title: isDesktop ? translate( 'Performance plans' ) : translate( 'Performance' ),
			},
		],
		[ isCurrentCatalog, isDesktop, translate, isStandardTabDisabled ]
	);

	if ( isLoading ) {
		return (
			<div className="pressable-overview-plan-selection__filter is-placeholder">
				<div className="pressable-overview-plan-selection__filter-type"></div>
				<div className="pressable-overview-plan-selection__filter-slider"></div>
			</div>
		);
	}

	const FilterByPicker = ( { hideInstallOption }: { hideInstallOption?: boolean } ) => (
		<div className="pressable-overview-plan-selection__filter-type">
			<p className="pressable-overview-plan-selection__filter-label">
				{ translate( 'Display plans by total' ) }
			</p>

			<RadioControl
				className="pressable-overview-plan-selection__filter-radio-control"
				selected={ filterType }
				options={ [
					...( hideInstallOption
						? []
						: [ { label: translate( 'WordPress installs' ), value: FILTER_TYPE_INSTALL } ] ),
					{ label: translate( 'Traffic' ), value: FILTER_TYPE_VISITS },
					{
						label: isMobile ? translate( 'Storage (GB)' ) : translate( 'Storage' ),
						value: FILTER_TYPE_STORAGE,
					},
				] }
				onChange={ ( value ) => onSelectFilterType( value as FilterType ) }
			/>
		</div>
	);

	return (
		<section className={ wrapperClass }>
			<TabPanel
				key={ selectedTab } // Force re-render when selectedTab changes
				className="pressable-overview-plan-selection__plan-category-tabpanel"
				activeClass="pressable-overview-plan-selection__plan-category-tab-is-active"
				onSelect={ onSelectTab }
				initialTabName={ selectedTab }
				tabs={ tabs }
			>
				{ ( tab ) => {
					switch ( tab.name ) {
						case PLAN_CATEGORY_LEGACY_STANDARD:
						case PLAN_CATEGORY_STANDARD_TIER:
							return (
								<>
									<FilterByPicker />
									<A4ASlider
										value={
											PLAN_CATEGORY_LEGACY_STANDARD === selectedTab ||
											PLAN_CATEGORY_STANDARD_TIER === selectedTab
												? selectedOptionIndex
												: 0
										}
										onChange={ onSelectOption }
										options={ standardTabOptions }
										minimum={ getSliderMinimum(
											isCurrentCatalog
												? PLAN_CATEGORY_STANDARD_TIER
												: PLAN_CATEGORY_LEGACY_STANDARD,
											standardTabOptions
										) }
									/>
								</>
							);
						case PLAN_CATEGORY_LEGACY_ENTERPRISE:
						case PLAN_CATEGORY_AGENCY_TIER:
							return (
								<>
									<FilterByPicker />
									<A4ASlider
										value={
											PLAN_CATEGORY_LEGACY_ENTERPRISE === selectedTab ||
											PLAN_CATEGORY_AGENCY_TIER === selectedTab
												? selectedOptionIndex
												: 0
										}
										onChange={ onSelectOption }
										options={ agencyTabOptions }
										minimum={ getSliderMinimum(
											isCurrentCatalog
												? PLAN_CATEGORY_AGENCY_TIER
												: PLAN_CATEGORY_LEGACY_ENTERPRISE,
											agencyTabOptions
										) }
									/>
								</>
							);
						case PLAN_CATEGORY_PERFORMANCE_TIER:
							return canReferPerformancePlans ? (
								<>
									<FilterByPicker hideInstallOption />
									<A4ASlider
										value={
											PLAN_CATEGORY_PERFORMANCE_TIER === selectedTab ? selectedOptionIndex : 0
										}
										onChange={ onSelectOption }
										options={ performanceTabOptions }
										minimum={ getSliderMinimum(
											PLAN_CATEGORY_PERFORMANCE_TIER,
											performanceTabOptions
										) }
									/>
								</>
							) : null;
						default:
							return null;
					}
				} }
			</TabPanel>
		</section>
	);
}
