import { Button } from '@wordpress/components';
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
	selectedPlan: APIProductFamilyProduct | null;
	plans: APIProductFamilyProduct[];
	pressablePlan?: PressablePlan | null;
	onSelectPlan: ( plan: APIProductFamilyProduct | null ) => void;
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

	const options = useMemo(
		() => [
			...getSliderOptions(
				filterType,
				plans.map( ( plan ) => getPressablePlan( plan.slug ) )
			),
			{
				label: translate( 'More' ),
				value: null,
			},
		],
		[ filterType, plans, translate ]
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

	const selectedOption = options.findIndex(
		( { value } ) => value === ( selectedPlan ? selectedPlan.slug : null )
	);

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

	return (
		<section className={ wrapperClass }>
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

			<A4ASlider
				value={ selectedOption }
				onChange={ onSelectOption }
				options={ options }
				minimum={ minimum }
			/>
		</section>
	);
}
