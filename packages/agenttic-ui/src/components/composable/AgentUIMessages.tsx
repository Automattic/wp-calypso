import React from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { Messages } from '../chat/Messages';

export interface AgentUIMessagesProps {
	className?: string;
}

export function AgentUIMessages( { className }: AgentUIMessagesProps = {} ) {
	const {
		messages,
		isProcessing,
		isStreaming,
		isReplying,
		error,
		errorNotice,
		emptyView,
		messageRenderer,
		messagesPosition,
		showAgentIcon,
		thinkingMessage,
	} = useAgentUIContext();

	return (
		<Messages
			messages={ messages }
			isProcessing={ isProcessing }
			isStreaming={ isStreaming }
			isReplying={ isReplying }
			error={ error }
			errorNotice={ errorNotice }
			emptyView={ emptyView }
			messageRenderer={ messageRenderer }
			thinkingMessage={ thinkingMessage }
			className={ className }
			messagesPosition={ messagesPosition }
			showAgentIcon={ showAgentIcon }
		/>
	);
}
