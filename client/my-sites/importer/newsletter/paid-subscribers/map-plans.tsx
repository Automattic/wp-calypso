import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import RecurringPaymentsPlanAddEditModal from 'calypso/my-sites/earn/components/add-edit-plan-modal';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	TYPE_TIER,
} from 'calypso/my-sites/earn/memberships/constants';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../importer-action-buttons/container';
import MapPlan from './map-plan';

type Props = {
	nextStepUrl: string;
	skipNextStep: () => void;
	cardData: any;
	siteId: string;
	engine: string;
	currentStep: string;
};

export default function MapPlans( {
	nextStepUrl,
	skipNextStep,
	cardData,
	siteId,
	engine,
	currentStep,
}: Props ) {
	const [ productToAdd, setProductToAdd ] = useState< Product | null >( null );

	const queryClient = useQueryClient();

	const closeDialog = () => {
		setProductToAdd( null );
	};

	const products = useSelector( ( state ) => getProductsForSiteId( state, siteId ) );
	const sizeOfProductsRef = useRef( products.length );

	const sizeOfProducts = products.length;
	// check if we added new products and if so invalidate the query to check it again.
	useEffect( () => {
		if ( sizeOfProducts === sizeOfProductsRef.current || sizeOfProducts === 0 ) {
			return;
		}
		sizeOfProductsRef.current = sizeOfProducts;
		queryClient.invalidateQueries( {
			queryKey: [ 'paid-newsletter-importer', siteId, engine, currentStep ],
		} );
	}, [ sizeOfProducts, sizeOfProductsRef, siteId, engine, currentStep, queryClient ] );

	const monthyPlan = cardData.plans.find( ( plan: any ) => plan.plan_interval === 'month' );

	const annualPlan = cardData.plans.find( ( plan: any ) => plan.plan_interval === 'year' );

	const tierToAdd = {
		currency: monthyPlan.plan_currency,
		price: formatCurrency( monthyPlan.plan_amount_decimal, monthyPlan.plan_currency, {
			isSmallestUnit: true,
		} ).replace( /[^\d.-]/g, '' ),
		type: TYPE_TIER,
		title: 'Newsletter tier',
		interval: PLAN_MONTHLY_FREQUENCY,
		annualProduct: {
			currency: annualPlan.plan_currency,
			price: formatCurrency( annualPlan.plan_amount_decimal, annualPlan.plan_currency, {
				isSmallestUnit: true,
			} ).replace( /[^\d.-]/g, '' ),
			type: TYPE_TIER,
			interval: PLAN_YEARLY_FREQUENCY,
		},
	};

	return (
		<Card>
			<h2>Paid newsletter offering</h2>
			<p>
				<strong>
					Review the plans retieved from Stripe and create euqivalent plans in WordPress.com
				</strong>{ ' ' }
				to prevent disruption to your current paid subscribers.
			</p>
			<div className="map-plans__mapping">
				<p>
					<strong>Existing Stripe plans</strong>
				</p>
				{ cardData.plans.map( ( plan: any ) => (
					<MapPlan
						key={ plan.plan_id }
						siteId={ siteId }
						engine={ engine }
						currentStep={ currentStep }
						plan={ plan }
						products={ cardData.available_tiers }
						map_plans={ cardData.map_plans }
						onProductAdd={ setProductToAdd }
						tierToAdd={ tierToAdd }
					/>
				) ) }
			</div>
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					primary
					href={ nextStepUrl }
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_map_plans' );
					} }
				>
					Continue
				</ImporterActionButton>
				<ImporterActionButton
					href={ nextStepUrl }
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_map_plans_skipped' );
						skipNextStep();
					} }
				>
					Skip for now
				</ImporterActionButton>
			</ImporterActionButtonContainer>
			{ productToAdd && (
				<RecurringPaymentsPlanAddEditModal
					closeDialog={ closeDialog }
					product={ productToAdd }
					annualProduct={ productToAdd.annualProduct }
					isOnlyTier
					hideWelcomeEmailInput
					hideAdvancedSettings
				/>
			) }
		</Card>
	);
}
