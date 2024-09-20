import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import { SubscribersStepProps } from '../types';

export default function StepDone( { cardData, nextStepUrl }: SubscribersStepProps ) {
	const subscribedCount = parseInt( cardData.meta?.subscribed_count || '0' );
	return (
		<Card>
			<h2>Import your subscribers to WordPress.com</h2>
			<Notice status="success" className="importer__notice" isDismissible={ false }>
				Success! { subscribedCount } subscribers have been added!
			</Notice>
			<ImporterActionButton href={ nextStepUrl }>View Summary</ImporterActionButton>
		</Card>
	);
}
