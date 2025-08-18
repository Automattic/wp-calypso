import React, { useEffect } from 'react';
import type { ComponentType } from 'react';
import type { Message, NoticeConfig, Suggestion } from '../../types';
import { ChatHeader } from '../chat/ChatHeader';
import { ChatInput } from '../chat/ChatInput';
import { Messages } from '../chat/Messages';
import { Notice } from '../chat/Notice';
import { Suggestions } from '../chat/Suggestions';
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
	error?: string | null;

	// UI state
	fromCompact?: boolean;

	// Header configuration
	showHeader?: boolean;
	onClose?: () => void;
	onExpand?: () => void;

	// Notifications
	notice?: NoticeConfig;

	// Empty state
	emptyView?: React.ReactNode;

	// Suggestions
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;

	// Markdown configuration
	messageRenderer?: ComponentType< { children: string } >;

	// Focus on mount
	focusOnMount?: boolean;
}

export function ConversationView( {
	messages,
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
	onExpand,
	notice,
	emptyView,
	suggestions,
	clearSuggestions,
	messageRenderer,
	focusOnMount = false,
}: ConversationViewProps ) {
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

	return (
		<div
			data-slot="conversation-view"
			className={ `${ styles.container }${
				showHeader ? ` ${ styles.withHeader }` : ''
			}` }
		>
			{ showHeader && <ChatHeader onClose={ onClose } /> }
			<Messages
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				emptyView={ emptyView }
				fromCompact={ fromCompact }
				messageRenderer={ messageRenderer }
			/>
			<div
				data-slot="input-container"
				className={ styles.inputContainer }
			>
				<Suggestions
					suggestions={ suggestions }
					onSubmit={ ( value ) => {
						onInputChange( value );
						clearSuggestions?.();
					} }
				/>
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
						onExpand={ onExpand }
						showExpandButton={ false }
						focusOnMount={ focusOnMount }
					/>
				</div>
			</div>
		</div>
	);
}
