import React from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { type ActionButton, ChatInput } from '../chat/ChatInput';

export interface AgentUIInputProps {
	className?: string;
	disabled?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
}

export function AgentUIInput( {
	className,
	disabled,
	customActions,
	actionOrder,
}: AgentUIInputProps = {} ) {
	const {
		inputValue,
		setInputValue,
		handleSubmit,
		handleKeyDown,
		textareaRef,
		placeholder,
		isProcessing,
		onStop,
		fromCompact,
		onExpand,
		showExpandButton,
		focusOnMount,
	} = useAgentUIContext();

	return (
		<ChatInput
			value={ inputValue }
			onChange={ setInputValue }
			onSubmit={ handleSubmit }
			onKeyDown={ handleKeyDown }
			textareaRef={ textareaRef }
			placeholder={ placeholder }
			isProcessing={ isProcessing }
			onStop={ onStop }
			fromCompact={ fromCompact }
			onExpand={ onExpand }
			showExpandButton={ showExpandButton }
			focusOnMount={ focusOnMount }
			disabled={ disabled }
			customActions={ customActions }
			actionOrder={ actionOrder }
			className={ className }
		/>
	);
}
