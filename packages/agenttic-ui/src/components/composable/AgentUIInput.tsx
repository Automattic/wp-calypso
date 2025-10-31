import React from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { type ActionButton, ChatInput } from '../chat/ChatInput';

export interface AgentUIInputProps {
	className?: string;
	disabled?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onKeyDown?: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
}

export function AgentUIInput( {
	className,
	disabled,
	customActions,
	actionOrder,
	onKeyDown,
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

	const onKeyDownHandler = (
		e: React.KeyboardEvent< HTMLTextAreaElement >
	) => {
		onKeyDown?.( e );

		if ( e.defaultPrevented ) {
			return;
		}

		handleKeyDown( e );
	};

	return (
		<ChatInput
			value={ inputValue }
			onChange={ setInputValue }
			onSubmit={ handleSubmit }
			onKeyDown={ onKeyDownHandler }
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
