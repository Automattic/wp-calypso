import { Card } from '@automattic/components';
import { useState } from 'react';
import RecurringPaymentsPlanAddEditModal from 'calypso/my-sites/earn/components/add-edit-plan-modal';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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

	const closeDialog = () => {};

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
				/>
			) }
		</Card>
	);
}
