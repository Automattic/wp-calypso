import React from 'react';
import { type ActionButton, ChatInput } from '../chat/ChatInput';

interface CompactViewProps {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string | string[];
	isProcessing: boolean;
	onBlur?: () => void;
	onExpand?: () => void;
	showExpandButton?: boolean;
	focusOnMount?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onStop?: () => void;
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
	customActions,
	actionOrder,
	onStop,
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
			customActions={ customActions }
			actionOrder={ actionOrder }
			onStop={ onStop }
		/>
	);
}
