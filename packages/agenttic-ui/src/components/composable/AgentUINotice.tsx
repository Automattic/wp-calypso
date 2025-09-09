import React from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { Notice } from '../chat/Notice';

export interface AgentUINoticeProps {
	className?: string;
}

export function AgentUINotice( { className }: AgentUINoticeProps = {} ) {
	const { notice } = useAgentUIContext();

	if ( ! notice ) {
		return null;
	}

	return (
		<Notice
			icon={ notice.icon }
			message={ notice.message }
			action={ notice.action }
			dismissible={ notice.dismissible }
			onDismiss={ notice.onDismiss }
			className={ className }
		/>
	);
}
