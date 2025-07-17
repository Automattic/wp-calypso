import React from 'react';
import { Messages } from '../chat/Messages';
import { ChatInput } from '../chat/ChatInput';
import { Notice } from '../chat/Notice';
import { ChatHeader } from '../chat/ChatHeader';
import type { Message, NoticeConfig } from '../../types';
import styles from './ConversationView.module.css';

interface InputHandlers {
	inputValue: string;
	onInputChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string;
	isProcessing: boolean;
}

interface ConversationViewProps extends InputHandlers {
	// Core data
	messages: Message[];

	// Agent state
	isThinking?: boolean;
	error?: string | null;

	// UI state
	fromCompact?: boolean;

	// Header configuration
	showHeader?: boolean;
	onClose?: () => void;
	onMinimize?: () => void;

	// Notifications
	notice?: NoticeConfig;

	// Empty state
	emptyView?: React.ReactNode;
}

export function ConversationView( {
	messages,
	isThinking,
	error,
	inputValue,
	onInputChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder,
	isProcessing,
	fromCompact = false,
	showHeader = false,
	onClose,
	onMinimize,
	notice,
	emptyView,
}: ConversationViewProps ) {
	return (
		<div data-slot="conversation-view" className={ styles.container }>
			{ showHeader && <ChatHeader onClose={ onClose } /> }
			<Messages
				messages={ messages }
				isThinking={ isThinking }
				error={ error }
				emptyView={ emptyView }
			/>
			<div className={ styles.inputContainer }>
				<div className={ styles.inputContainerInner }>
					{ notice && (
						<Notice
							icon={ notice.icon }
							message={ notice.message }
							action={ notice.action }
							dismissible={ notice.dismissible }
							onDismiss={ notice.onDismiss }
						/>
					) }
					<ChatInput
						value={ inputValue }
						onChange={ onInputChange }
						onSubmit={ onSubmit }
						onKeyDown={ onKeyDown }
						textareaRef={ textareaRef }
						placeholder={ placeholder }
						isProcessing={ isProcessing }
						fromCompact={ fromCompact }
					/>
				</div>
			</div>
		</div>
	);
}
