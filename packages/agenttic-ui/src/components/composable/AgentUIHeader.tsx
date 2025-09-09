import React from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { ChatHeader } from '../chat/ChatHeader';

export interface AgentUIHeaderProps {
	className?: string;
}

export function AgentUIHeader( { className }: AgentUIHeaderProps = {} ) {
	const { onClose } = useAgentUIContext();

	return <ChatHeader onClose={ onClose } className={ className } />;
}
