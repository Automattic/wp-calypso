import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import useProductAndPlans from '../../../hooks/use-product-and-plans';
import PlanSelectionDetails from './../details';
import PlanSelectionFilter from './../filter';

import '../style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct ) => void;
};

export default function ReferralPressableOverviewPlanSelection( { onAddToCart }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const onSelectPlan = useCallback(
		( plan: APIProductFamilyProduct | null ) => {
			setSelectedPlan( plan );
		},
		[ setSelectedPlan ]
	);

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	useEffect( () => {
		if ( pressablePlans?.length ) {
			setSelectedPlan( pressablePlans.find( ( plan ) => plan.slug === 'pressable-build' ) ?? null );
		}
	}, [ pressablePlans, setSelectedPlan ] );

	const onPlanAddToCart = useCallback( () => {
		if ( selectedPlan ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_select_plan_click', {
					slug: selectedPlan?.slug,
				} )
			);
			onAddToCart( selectedPlan );
		}
	}, [ dispatch, onAddToCart, selectedPlan ] );

	return (
		<div
			className={ clsx( 'pressable-overview-plan-selection', {
				'is-new-hosting-page': isNewHostingPage,
			} ) }
		>
			<div className="pressable-overview-plan-selection__upgrade-title narrow">
				{ translate( 'Choose plan to refer' ) }
			</div>
			<PlanSelectionFilter
				selectedPlan={ selectedPlan }
				plans={ pressablePlans }
				onSelectPlan={ onSelectPlan }
			/>

			<PlanSelectionDetails
				selectedPlan={ selectedPlan }
				onSelectPlan={ onPlanAddToCart }
				pressableOwnership="agency"
			/>
		</div>
	);
}
