import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { FILTER_TYPE_INSTALL, FILTER_TYPE_VISITS } from '../constants';
import useExistingPressablePlan from '../hooks/use-existing-pressable-plan';
import getPressablePlan from '../lib/get-pressable-plan';
import getSliderOptions from '../lib/get-slider-options';
import { FilterType } from '../types';

type Props = {
	selectedPlan: APIProductFamilyProduct | null;
	plans: APIProductFamilyProduct[];
	onSelectPlan: ( plan: APIProductFamilyProduct | null ) => void;
};

export default function PlanSelectionFilter( { selectedPlan, plans, onSelectPlan }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ filterType, setFilterType ] = useState< FilterType >( FILTER_TYPE_INSTALL );

	const { existingPlan, isFetching: isFetchingExistingPlan } = useExistingPressablePlan( {
		plans,
	} );

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
	const wrapperClass = classNames(
		additionalWrapperClass,
		'pressable-overview-plan-selection__filter'
	);

	const minimum = existingPlan
		? options.findIndex( ( { value } ) => value === existingPlan.slug ) + 1
		: 0;

	return (
		<section className={ wrapperClass }>
			<div className="pressable-overview-plan-selection__filter-type">
				<p className="pressable-overview-plan-selection__filter-label">
					{ translate( 'Filter by:' ) }
				</p>
				<div className="pressable-overview-plan-selection__filter-buttons">
					<Button
						className={ classNames( 'pressable-overview-plan-selection__filter-button', {
							'is-selected': filterType === FILTER_TYPE_INSTALL,
						} ) }
						onClick={ onSelectInstallFilterType }
					>
						{ translate( 'WordPress installs' ) }
					</Button>

					<Button
						className={ classNames( 'pressable-overview-plan-selection__filter-button', {
							'is-selected': filterType === FILTER_TYPE_VISITS,
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
