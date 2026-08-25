import {
	AGENTS_MANAGER_STORE,
	closeAgentsManagerChat,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import BigSkyIcon from './big-sky-icon';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import './style.scss';

const MasterbarAiChatButton = () => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );

	const { isOpen, isMinimized } = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getAgentsManagerState(),
		[]
	);
	const isChatVisible = isOpen && ! isMinimized;

	// Toggle: close the chat if it's already showing, otherwise resume the active
	// conversation and open it.
	const handleClick = () => {
		recordAgentsManagerTracksEvent( 'calypso_masterbar_agents_manager_ai_chat_clicked', {
			section: sectionName || 'unknown',
			action: isChatVisible ? 'close' : 'open',
		} );
		if ( isChatVisible ) {
			closeAgentsManagerChat();
		} else {
			openAgentsManagerChat();
		}
	};

	return (
		<Item
			className="masterbar__item-agents-manager-ai-chat"
			onClick={ handleClick }
			icon={ <BigSkyIcon /> }
			isActive={ isChatVisible }
			tooltip={ translate( 'Ask AI' ) }
		/>
	);
};

export default MasterbarAiChatButton;
