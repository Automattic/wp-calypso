import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import { SubscribersStepProps } from '../types';

export default function StepDone( { cardData, nextStepUrl }: SubscribersStepProps ) {
	const { __ } = useI18n();
	const subscribedCount = parseInt( cardData?.meta?.email_count || '0' );

	return (
		<Card>
			<h2>{ __( 'Import your subscribers to WordPress.com' ) }</h2>
			<Notice status="success" className="importer__notice" isDismissible={ false }>
				Success! { subscribedCount } subscribers have been added!
			</Notice>
			<ImporterActionButton href={ nextStepUrl }>{ __( 'View Summary' ) }</ImporterActionButton>
		</Card>
	);
}
