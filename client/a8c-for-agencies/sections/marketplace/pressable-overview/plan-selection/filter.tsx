import { Button, TabPanel } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { FILTER_TYPE_INSTALL, FILTER_TYPE_VISITS } from '../constants';
import getPressablePlan, { PressablePlan } from '../lib/get-pressable-plan';
import getSliderOptions from '../lib/get-slider-options';
import { FilterType } from '../types';

type Props = {
	// Plan details for the plan that's currently selected in the UI
	selectedPlan: APIProductFamilyProduct | null;
	// All available Pressable plans
	plans: APIProductFamilyProduct[];
	// The users existing Pressable plan
	pressablePlan?: PressablePlan | null;
	// Plan selection handler
	onSelectPlan: ( plan: APIProductFamilyProduct | null ) => void;
	// Whether the existing plan is still being loaded
	isLoading?: boolean;
};

export default function PlanSelectionFilter( {
	selectedPlan,
	plans,
	onSelectPlan,
	pressablePlan,
	isLoading,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ filterType, setFilterType ] = useState< FilterType >( FILTER_TYPE_INSTALL );
	const [ selectedTab, setSelectedTab ] = useState( 'standard' );

	const options = useMemo(
		() => [
			...getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) )
			),
			{
				label: translate( 'More' ),
				value: null,
				category: null,
			},
		],
		[ filterType, plans, translate ]
	);

	// Split options based on category then remove the category property
	const standardOptions = options
		.filter( ( option ) => option.category === 'standard' )
		.map( ( { category, ...rest } ) => rest );

	const enterpriseOptions = options
		.filter( ( option ) => option.category === 'enterprise' )
		.map( ( { category, ...rest } ) => rest );

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

	const selectedCategory =
		options.find( ( { value } ) => value === ( selectedPlan ? selectedPlan.slug : null ) )
			?.category || null;

	const selectedOptionIndex = (
		'standard' === selectedCategory ? standardOptions : enterpriseOptions
	).findIndex( ( { value } ) => value === ( selectedPlan ? selectedPlan.slug : null ) );

	const onSelectInstallFilterType = useCallback( () => {
		setFilterType( FILTER_TYPE_INSTALL );
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_filter_by_install_click' )
		);
	}, [ dispatch ] );

	const onSelectVisitFilterType = useCallback( () => {
		setFilterType( FILTER_TYPE_VISITS );
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_filter_by_visits_click' )
		);
	}, [ dispatch ] );

	const additionalWrapperClass =
		filterType === FILTER_TYPE_INSTALL
			? 'a4a-pressable-filter-wrapper-install'
			: 'a4a-pressable-filter-wrapper-visits';
	const wrapperClass = clsx( additionalWrapperClass, 'pressable-overview-plan-selection__filter' );

	const minimum = useMemo( () => {
		if ( ! pressablePlan ) {
			return 0;
		}

		const allAvailablePlans = plans
			.map( ( plan ) => getPressablePlan( plan.slug ) )
			.filter( ( plan ) => plan !== undefined )
			.sort( ( a, b ) => a?.install - b?.install );

		for ( let i = 0; i < allAvailablePlans.length; i++ ) {
			if ( pressablePlan?.install < allAvailablePlans[ i ]?.install ) {
				return i;
			}
		}
		return allAvailablePlans.length;
	}, [ plans, pressablePlan ] );

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
				{ translate( 'Filter by:' ) }
			</p>
			<div className="pressable-overview-plan-selection__filter-buttons">
				<Button
					className={ clsx( 'pressable-overview-plan-selection__filter-button', {
						'is-dark': filterType === FILTER_TYPE_INSTALL,
					} ) }
					onClick={ onSelectInstallFilterType }
				>
					{ translate( 'WordPress installs' ) }
				</Button>

				<Button
					className={ clsx( 'pressable-overview-plan-selection__filter-button', {
						'is-dark': filterType === FILTER_TYPE_VISITS,
					} ) }
					onClick={ onSelectVisitFilterType }
				>
					{ translate( 'Number of visits' ) }
				</Button>
			</div>
		</div>
	);

	return (
		<section className={ wrapperClass }>
			<TabPanel
				className="pressable-overview-plan-selection__plan-category-panel"
				activeClass="active-tab"
				tabs={ [
					{
						name: 'standard',
						title: translate( 'Shared Resource Plans' ),
					},
					{
						name: 'enterprise',
						title: translate( 'Signature Shared Resource Plans' ),
					},
				] }
				onSelect={ setSelectedTab }
				initialTabName={ selectedTab }
			>
				{ ( tab ) => {
					switch ( tab.name ) {
						case 'standard':
							return (
								<>
									<FilterByPicker />
									<A4ASlider
										value={ 'standard' === selectedCategory ? selectedOptionIndex : 0 }
										onChange={ onSelectOption }
										options={ standardOptions }
										minimum={
											'standard' === pressablePlan?.category ? minimum : standardOptions.length - 1
										}
									/>
								</>
							);
						case 'enterprise':
							return (
								<>
									<FilterByPicker />
									<A4ASlider
										value={ 'enterprise' === selectedCategory ? selectedOptionIndex : 0 }
										onChange={ onSelectOption }
										options={ enterpriseOptions }
										minimum={ 'enterprise' === pressablePlan?.category ? minimum : 0 }
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
