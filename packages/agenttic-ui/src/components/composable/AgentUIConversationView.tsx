import React, { useEffect } from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { AgentUIHeader } from './AgentUIHeader';
import { AgentUIMessages } from './AgentUIMessages';
import { AgentUIFooter } from './AgentUIFooter';
import styles from '../views/ConversationView.module.css';

export interface AgentUIConversationViewProps {
	showHeader?: boolean;
	children?: React.ReactNode;
	className?: string;
}

export function AgentUIConversationView( {
	showHeader = true,
	children,
	className,
}: AgentUIConversationViewProps = {} ) {
	const { onClose } = useAgentUIContext();

	// Listen for escape key to close the chat
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' && onClose ) {
				onClose();
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ onClose ] );

	if ( children ) {
		return (
			<div
				data-slot="conversation-view"
				className={ `${ styles.container }${
					className ? ` ${ className }` : ''
				}` }
			>
				{ children }
			</div>
		);
	}

	// Default composition - matches current ConversationView
	return (
		<div
			data-slot="conversation-view"
			className={ `${ styles.container }${
				showHeader ? ` ${ styles.withHeader }` : ''
			}${ className ? ` ${ className }` : '' }` }
		>
			{ showHeader && <AgentUIHeader /> }
			<AgentUIMessages />
			<AgentUIFooter />
		</div>
	);
}
