import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { SubscribersStepProps } from '../types';

interface StepDoneProps extends SubscribersStepProps {
	actionButton?: React.ReactNode;
}

export default function StepDone( { cardData, actionButton }: StepDoneProps ) {
	const { __, _n } = useI18n();
	const subscribedCount = parseInt( cardData?.meta?.email_count || '0' );

	return (
		<Card>
			<h2>{ __( 'Import your subscribers' ) }</h2>
			<Notice status="success" className="importer__notice" isDismissible={ false }>
				{ sprintf(
					// Translators: %d is number of subscribers.
					_n(
						'Success! %d subscriber has been added!',
						'Success! %d subscribers have been added!',
						subscribedCount
					),
					subscribedCount
				) }
			</Notice>
			{ actionButton }
		</Card>
	);
}
