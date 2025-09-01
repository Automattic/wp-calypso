import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useOdieAssistantContext } from '../../context';
import { useManageSupportInteraction } from '../../data';
import './style.scss';

export const ClosedConversationFooter = () => {
	const { __ } = useI18n();
	const { trackEvent } = useOdieAssistantContext();

	const { startNewInteraction } = useManageSupportInteraction();

	const handleOnClick = async () => {
		trackEvent( 'chat_new_from_closed_conversation' );
		await startNewInteraction( {
			event_source: 'help-center',
			event_external_id: crypto.randomUUID(),
		} );
	};

	return (
		<Button
			onClick={ handleOnClick }
			className="button odie-closed-conversation-footer__button"
			variant="secondary"
			__next40pxDefaultSize
		>
			{ __( 'Still need help? Start a new chat', __i18n_text_domain__ ) }
		</Button>
	);
};
