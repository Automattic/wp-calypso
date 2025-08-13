import React from 'react';
import { ChatInput } from '../chat/ChatInput';

interface CompactViewProps {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string;
	isProcessing: boolean;
	onBlur?: () => void;
	onExpand?: () => void;
	showExpandButton?: boolean;
	focusOnMount?: boolean;
}

export function CompactView( {
	value,
	onChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder,
	isProcessing,
	onBlur,
	onExpand,
	showExpandButton = true,
	focusOnMount = false,
}: CompactViewProps ) {
	return (
		<ChatInput
			value={ value }
			onChange={ onChange }
			onSubmit={ onSubmit }
			onKeyDown={ onKeyDown }
			textareaRef={ textareaRef }
			placeholder={ placeholder }
			isProcessing={ isProcessing }
			onBlur={ onBlur }
			onExpand={ onExpand }
			showExpandButton={ showExpandButton }
			focusOnMount={ focusOnMount }
		/>
	);
}
