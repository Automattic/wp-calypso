import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { useCallback, useEffect, useState, useContext } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { MarketplaceTypeContext } from '../../context';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import usePressableOwnershipType from '../../hosting-overview/hooks/use-pressable-ownership-type';
import useExistingPressablePlan from '../hooks/use-existing-pressable-plan';
import PlanSelectionDetails from './details';
import PlanSelectionFilter from './filter';

import './style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct ) => void;
};

export default function PressableOverviewPlanSelection( { onAddToCart }: Props ) {
	const dispatch = useDispatch();

	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const isReferMode = marketplaceType === 'referral';

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

	const { existingPlan, isReady: isExistingPlanFetched } = useExistingPressablePlan( {
		plans: pressablePlans,
	} );

	useEffect( () => {
		if ( pressablePlans?.length ) {
			setSelectedPlan( pressablePlans[ 0 ] );
		}
	}, [ pressablePlans, setSelectedPlan ] );

	useEffect( () => {
		if ( existingPlan ) {
			setSelectedPlan( existingPlan );
		}
	}, [ existingPlan ] );

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

	const pressableOwnership = usePressableOwnershipType();

	return (
		<div
			className={ clsx( 'pressable-overview-plan-selection', {
				'is-new-hosting-page': isNewHostingPage,
				'is-slider-hidden': pressableOwnership === 'regular' || isReferMode,
			} ) }
		>
			{ pressableOwnership !== 'regular' && ! isReferMode && (
				<PlanSelectionFilter
					selectedPlan={ selectedPlan }
					plans={ pressablePlans }
					onSelectPlan={ onSelectPlan }
					existingPlan={ existingPlan }
					isLoading={ ! isExistingPlanFetched }
				/>
			) }

			<PlanSelectionDetails
				selectedPlan={ selectedPlan }
				onSelectPlan={ onPlanAddToCart }
				isLoading={ ! isExistingPlanFetched }
				pressableOwnership={ pressableOwnership }
				isReferMode={ isReferMode }
			/>
		</div>
	);
}
