import React, { useCallback } from 'react';
import type { NoticeConfig, Suggestion } from '../../types';
import { ChatInput } from './ChatInput';
import { Notice } from './Notice';
import { Suggestions } from './Suggestions';
import styles from './ChatFooter.module.css';

interface ChatFooterProps {
	// Input handlers
	inputValue: string;
	onInputChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string;
	isProcessing: boolean;

	// UI state
	fromCompact?: boolean;
	onExpand?: () => void;

	// Notifications
	notice?: NoticeConfig;

	// Suggestions
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;

	// Focus on mount
	focusOnMount?: boolean;
}

export function ChatFooter( {
	inputValue,
	onInputChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder,
	isProcessing,
	fromCompact = false,
	onExpand,
	notice,
	suggestions,
	clearSuggestions,
	focusOnMount,
}: ChatFooterProps ) {
	const handleSuggestionSubmit = useCallback(
		( value: string ) => {
			onInputChange( value );
			clearSuggestions?.();
		},
		[ onInputChange, clearSuggestions ]
	);
	return (
		<div data-slot="chat-footer" className={ styles.container }>
			<Suggestions
				suggestions={ suggestions }
				onSubmit={ handleSuggestionSubmit }
			/>
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
	);
}
