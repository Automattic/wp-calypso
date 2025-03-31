import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { v4 as uuidv4 } from 'uuid';
import { useOdieAssistantContext } from '../../context';
import { useManageSupportInteraction } from '../../data';
import { interactionHasEnded } from '../../utils';
import './style.scss';

export const ClosedConversationFooter = () => {
	const { __ } = useI18n();
	const { trackEvent } = useOdieAssistantContext();

	const { startNewInteraction } = useManageSupportInteraction();

	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const handleOnClick = async () => {
		trackEvent( 'chat_new_from_closed_conversation' );
		await startNewInteraction( {
			event_source: 'help-center',
			event_external_id: uuidv4(),
		} );
	};

	if ( ! interactionHasEnded( currentSupportInteraction ) ) {
		return null;
	}

	return (
		<div className="odie-closed-conversation-footer">
			<Button onClick={ handleOnClick } className="odie-closed-conversation-footer__button">
				<Icon icon={ comment } />
				{ __( 'New conversation', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
};
