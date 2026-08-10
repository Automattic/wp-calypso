import React, { forwardRef, useEffect } from 'react';
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

export const AgentUIConversationView = forwardRef<
	HTMLDivElement,
	AgentUIConversationViewProps
>( function AgentUIConversationView(
	{
		showHeader = true,
		children,
		className,
	}: AgentUIConversationViewProps = {},
	ref
) {
	const { onClose } = useAgentUIContext();

	// Listen for escape key to close the chat. Overlays that handle Escape
	// themselves (modals, dialogs, popovers) call preventDefault(), so skip
	// those presses and let the innermost layer close alone.
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.defaultPrevented ) {
				return;
			}
			if ( event.key === 'Escape' && onClose ) {
				onClose();
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ onClose ] );

	if ( children ) {
		// Check if there's an AgentUIHeader component among the children
		const hasHeader = React.Children.toArray( children ).some(
			( child ) => {
				return (
					React.isValidElement( child ) &&
					( child.type === AgentUIHeader ||
						( typeof child.type === 'function' &&
							child.type.name === 'AgentUIHeader' ) )
				);
			}
		);

		return (
			<div
				ref={ ref }
				data-slot="conversation-view"
				className={ `${ styles.container }${
					hasHeader ? ` ${ styles.withHeader }` : ''
				}${ className ? ` ${ className }` : '' }` }
			>
				{ children }
			</div>
		);
	}

	// Default composition - matches current ConversationView
	return (
		<div
			ref={ ref }
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
} );

AgentUIConversationView.displayName = 'AgentUIConversationView';
