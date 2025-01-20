import { Button } from '@wordpress/components';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { v4 as uuidv4 } from 'uuid';
import { useOdieAssistantContext } from '../../context';
import { useManageSupportInteraction } from '../../data';
import './style.scss';

export const ClosedConversationFooter = () => {
	const { __ } = useI18n();
	const { trackEvent, chat } = useOdieAssistantContext();

	const { startNewInteraction } = useManageSupportInteraction();

	const handleOnClick = async () => {
		trackEvent( 'chat_new_from_closed_conversation' );
		await startNewInteraction( {
			event_source: 'help-center',
			event_external_id: uuidv4(),
		} );
	};

	if ( chat.status !== 'closed' ) {
		return null;
	}

	return (
		<div className="odie-closed-conversation-footer">
			<span>{ __( 'This conversation has been completed', __i18n_text_domain__ ) }</span>

			<Button onClick={ handleOnClick } className="odie-closed-conversation-footer__button">
				<Icon icon={ comment } />
				{ __( 'New conversation', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
};
