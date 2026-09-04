import {
	AiChatEntryLabel,
	closeAgentsManagerChat,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
	useAiChatEntryState,
} from '@automattic/agents-manager';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import BigSkyIcon from './big-sky-icon';
import './style.scss';

const MasterbarAiChatButton = () => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	const { isChatVisible } = useAiChatEntryState();
	const label = translate( 'Agent' );

	// Toggle: close the chat if it's already showing, otherwise resume the active
	// conversation and open it.
	const handleClick = () => {
		recordAgentsManagerTracksEvent( 'calypso_agents_manager_ai_chat_clicked', {
			surface: 'masterbar',
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
			tooltip={ label }
		>
			<AiChatEntryLabel>{ label }</AiChatEntryLabel>
		</Item>
	);
};

export default MasterbarAiChatButton;
