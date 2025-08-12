import { useMobileBreakpoint } from '@automattic/viewport-react';
import { RadioControl, TabPanel } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import {
	FILTER_TYPE_INSTALL,
	FILTER_TYPE_VISITS,
	PLAN_CATEGORY_STANDARD,
	PLAN_CATEGORY_ENTERPRISE,
	PLAN_CATEGORY_HIGH_RESOURCE,
	FILTER_TYPE_STORAGE,
	PLAN_CATEGORY_SIGNATURE,
	PLAN_CATEGORY_SIGNATURE_HIGH,
} from '../constants';
import getPressablePlan, { PressablePlan } from '../lib/get-pressable-plan';
import getSliderOptions from '../lib/get-slider-options';
import { FilterType } from '../types';

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
	showHighResourceTab?: boolean;
	areSignaturePlans?: boolean;
};

export default function PlanSelectionFilter( {
	selectedPlan,
	plans,
	onSelectPlan,
	pressablePlan,
	isLoading,
	showHighResourceTab = false,
	areSignaturePlans: areSignaturePlans = false,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ filterType, setFilterType ] = useState< FilterType >( FILTER_TYPE_INSTALL );
	const [ selectedTab, setSelectedTab ] = useState(
		areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD
	);
	const [ disableStandardTab, setDisableStandardTab ] = useState( false );

	const isMobile = useMobileBreakpoint();

	const lowPlanOptions = useMemo(
		() =>
			getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) ),
				areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD,
				isMobile
			),
		[ filterType, isMobile, plans, areSignaturePlans ]
	);

	const highPlanOptions = useMemo(
		() => [
			...getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) ),
				areSignaturePlans ? PLAN_CATEGORY_SIGNATURE_HIGH : PLAN_CATEGORY_ENTERPRISE,
				isMobile
			),
			...( showHighResourceTab
				? []
				: [
						{
							label: translate( 'More' ),
							value: null,
							category: null,
						},
				  ] ),
		],
		[ filterType, isMobile, plans, showHighResourceTab, translate, areSignaturePlans ]
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

	const selectedOptionIndex = (
		PLAN_CATEGORY_STANDARD === selectedTab || PLAN_CATEGORY_SIGNATURE === selectedTab
			? lowPlanOptions
			: highPlanOptions
	).findIndex( ( { value } ) => value === ( selectedPlan ? selectedPlan.slug : null ) );

	const onSelectFilterType = useCallback(
		( value: FilterType ) => {
			setFilterType( value );
			dispatch(
				recordTracksEvent( `calypso_a4a_marketplace_hosting_pressable_filter_by_${ value }_click` )
			);
		},
		[ dispatch ]
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
				PLAN_CATEGORY_STANDARD === category || PLAN_CATEGORY_SIGNATURE === category;
			const isEnterpriseCategory =
				PLAN_CATEGORY_ENTERPRISE === category || PLAN_CATEGORY_SIGNATURE_HIGH === category;
			const isPlanStandardCategory =
				PLAN_CATEGORY_STANDARD === pressablePlan?.category ||
				PLAN_CATEGORY_SIGNATURE === pressablePlan?.category;
			const isPlanEnterpriseCategory =
				PLAN_CATEGORY_ENTERPRISE === pressablePlan?.category ||
				PLAN_CATEGORY_SIGNATURE_HIGH === pressablePlan?.category;

			if ( isStandardCategory && ! isPlanStandardCategory ) {
				return categoryOptions.length - 1;
			} else if ( isEnterpriseCategory && ! isPlanEnterpriseCategory ) {
				return 0;
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
		// If there's no existing plan, set the default tab based on areSignaturePlans
		if ( ! pressablePlan ) {
			setSelectedTab( areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD );
			setDisableStandardTab( false ); // Ensure standard tab is not disabled if no existing plan
			return;
		}

		// If there is an existing plan, map its category to the appropriate tab
		let tabCategory = pressablePlan.category;
		if ( areSignaturePlans ) {
			if ( pressablePlan.category === PLAN_CATEGORY_STANDARD ) {
				tabCategory = PLAN_CATEGORY_SIGNATURE;
			} else if ( pressablePlan.category === PLAN_CATEGORY_ENTERPRISE ) {
				tabCategory = PLAN_CATEGORY_SIGNATURE_HIGH;
			}
		} else if ( pressablePlan.category === PLAN_CATEGORY_SIGNATURE ) {
			// If not using signature plans, map signature categories back to standard/enterprise
			tabCategory = PLAN_CATEGORY_STANDARD;
		} else if ( pressablePlan.category === PLAN_CATEGORY_SIGNATURE_HIGH ) {
			tabCategory = PLAN_CATEGORY_ENTERPRISE;
		}
		setSelectedTab( tabCategory );

		// Disable the standard tab if the existing plan is the highest standard plan or higher
		const isStandardCategory =
			pressablePlan.category === PLAN_CATEGORY_STANDARD ||
			pressablePlan.category === PLAN_CATEGORY_SIGNATURE;
		if (
			! isStandardCategory ||
			pressablePlan.slug === lowPlanOptions[ lowPlanOptions.length - 1 ]?.value
		) {
			setDisableStandardTab( true );
		} else {
			setDisableStandardTab( false );
		}
	}, [ pressablePlan, lowPlanOptions, areSignaturePlans ] );

	useEffect( () => {
		if ( selectedTab === PLAN_CATEGORY_HIGH_RESOURCE ) {
			onSelectPlan( null );
		}
	}, [ onSelectPlan, selectedTab ] );

	if ( isLoading ) {
		return (
			<div className="pressable-overview-plan-selection__filter is-placeholder">
				<div className="pressable-overview-plan-selection__filter-type"></div>
				<div className="pressable-overview-plan-selection__filter-slider"></div>
			</div>
		);
	}

	const FilterByPicker = () => (
		<div className="pressable-overview-plan-selection__filter-type">
			<p className="pressable-overview-plan-selection__filter-label">
				{ translate( 'Display plans by total' ) }
			</p>

			<RadioControl
				className="pressable-overview-plan-selection__filter-radio-control"
				selected={ filterType }
				options={ [
					{ label: translate( 'WordPress installs' ), value: FILTER_TYPE_INSTALL },
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
				onSelect={ setSelectedTab }
				initialTabName={ selectedTab }
				tabs={
					areSignaturePlans
						? [
								{
									name: PLAN_CATEGORY_SIGNATURE,
									title: translate( 'Signature Plans 1–10' ),
									disabled: disableStandardTab,
								},
								{
									name: PLAN_CATEGORY_SIGNATURE_HIGH,
									title: translate( 'Signature Plans 11–17' ),
								},
								...( showHighResourceTab
									? [
											{
												name: PLAN_CATEGORY_HIGH_RESOURCE,
												title: translate( 'High Resource Plans' ),
											},
									  ]
									: [] ),
						  ]
						: [
								{
									name: PLAN_CATEGORY_STANDARD,
									title: translate( 'Signature Plans' ),
									disabled: disableStandardTab,
								},
								{
									name: PLAN_CATEGORY_ENTERPRISE,
									title: translate( 'Enterprise Plans' ),
								},
								...( showHighResourceTab
									? [
											{
												name: PLAN_CATEGORY_HIGH_RESOURCE,
												title: translate( 'High Resource Plans' ),
											},
									  ]
									: [] ),
						  ]
				}
			>
				{ ( tab ) => {
					switch ( tab.name ) {
						case PLAN_CATEGORY_STANDARD:
						case PLAN_CATEGORY_SIGNATURE:
							return (
								<>
									<FilterByPicker />
									<A4ASlider
										value={
											PLAN_CATEGORY_STANDARD === selectedTab ||
											PLAN_CATEGORY_SIGNATURE === selectedTab
												? selectedOptionIndex
												: 0
										}
										onChange={ onSelectOption }
										options={ lowPlanOptions }
										minimum={ getSliderMinimum(
											areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD,
											lowPlanOptions
										) }
									/>
								</>
							);
						case PLAN_CATEGORY_ENTERPRISE:
						case PLAN_CATEGORY_SIGNATURE_HIGH:
							return (
								<>
									<FilterByPicker />
									<A4ASlider
										value={
											PLAN_CATEGORY_ENTERPRISE === selectedTab ||
											PLAN_CATEGORY_SIGNATURE_HIGH === selectedTab
												? selectedOptionIndex
												: 0
										}
										onChange={ onSelectOption }
										options={ highPlanOptions }
										minimum={ getSliderMinimum(
											areSignaturePlans ? PLAN_CATEGORY_SIGNATURE_HIGH : PLAN_CATEGORY_ENTERPRISE,
											highPlanOptions
										) }
									/>
								</>
							);
						default:
							return null;
					}
				} }
			</TabPanel>
		</section>
	);
}
