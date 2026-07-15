import { motion } from 'framer-motion';
import React, { useCallback } from 'react';
import type { NoticeConfig, Suggestion } from '../../types';
import { fastSpring } from '../animations';
import { type ActionButton, ChatInput } from './ChatInput';
import { Notice } from './Notice';
import { Suggestions } from './Suggestions';
import {
	ComplianceDisclosure,
	DefaultComplianceDisclosure,
} from './ComplianceDisclosure';
import styles from './ChatFooter.module.css';

interface ChatFooterProps {
	// Input handlers
	inputValue: string;
	onInputChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string | string[];
	isProcessing: boolean;
	onStop?: () => void;

	// UI state
	fromCompact?: boolean;
	onExpand?: () => void;

	// Validation
	disabled?: boolean;

	// Notifications
	notice?: NoticeConfig;

	// Suggestions
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;

	// Focus on mount
	focusOnMount?: boolean;

	// Custom actions
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';

	// AI-interaction disclosure shown below the input box (EU AI Act Art.
	// 50(1)). Defaults to a generic sentence with a guidelines link; pass
	// `false` to hide or a node to override.
	complianceDisclosure?: React.ReactNode | false;
}

export function ChatFooter( {
	inputValue,
	onInputChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder,
	isProcessing,
	onStop,
	fromCompact = false,
	onExpand,
	disabled,
	notice,
	suggestions,
	clearSuggestions,
	focusOnMount,
	customActions,
	actionOrder,
	complianceDisclosure = <DefaultComplianceDisclosure />,
}: ChatFooterProps ) {
	const handleSuggestionSubmit = useCallback(
		( selectedSuggestion: Suggestion ) => {
			const value = selectedSuggestion.prompt ?? selectedSuggestion.label;
			onInputChange( value );
			clearSuggestions?.();
		},
		[ onInputChange, clearSuggestions ]
	);
	return (
		<>
			<motion.div
				data-slot="chat-footer"
				className={ styles.container }
				initial={ { opacity: 0, scale: 1 } }
				animate={ { opacity: 1, scale: 1 } }
				transition={ { ...fastSpring } }
			>
				{ ! inputValue && (
					<Suggestions
						suggestions={ suggestions }
						onSubmit={ handleSuggestionSubmit }
					/>
				) }
				{ notice && (
					<Notice
						icon={ notice.icon }
						message={ notice.message }
						action={ notice.action }
						dismissible={ notice.dismissible }
						onDismiss={ notice.onDismiss }
						status={ notice.status }
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
					onStop={ onStop }
					fromCompact={ fromCompact }
					onExpand={ onExpand }
					showExpandButton={ false }
					focusOnMount={ focusOnMount }
					customActions={ customActions }
					actionOrder={ actionOrder }
					disabled={ disabled }
				/>
			</motion.div>
			<ComplianceDisclosure>
				{ complianceDisclosure }
			</ComplianceDisclosure>
		</>
	);
}
