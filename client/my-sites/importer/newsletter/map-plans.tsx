import { Card } from '@automattic/components';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';

type Props = {
	nextStepUrl: string;
	skipNextStep: () => void;
	cardData: any;
};

export default function MapPlans( { nextStepUrl, skipNextStep }: Props ) {
	return (
		<Card>
			<h2>Paid newsletter offering</h2>
			<p>
				<strong>
					Review the plans retieved from Stripe and create euqivalent plans in WordPress.com
				</strong>{ ' ' }
				to prevent disruption to your current paid subscribers.
			</p>
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
		</Card>
	);
}
