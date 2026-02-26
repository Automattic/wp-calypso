import React, { useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { type ActionButton, ChatInput } from '../chat/ChatInput';
import type { ImageUploaderHandle } from '../chat/ImageUploader';
import { PlusIcon } from '../icons/PlusIcon';

export interface AgentUIInputProps {
	className?: string;
	disabled?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onKeyDown?: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	layout?: 'inline' | 'stacked';
	imageUploaderRef?: React.RefObject< ImageUploaderHandle >;
}

export function AgentUIInput( {
	className,
	disabled,
	customActions,
	actionOrder,
	onKeyDown,
	layout,
	imageUploaderRef,
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
		onInputFocus,
		onInputBlur,
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

	// When imageUploaderRef is provided, prepend a "+" button to custom actions
	const resolvedActions = useMemo( () => {
		if ( ! imageUploaderRef ) {
			return customActions;
		}

		const uploadAction: ActionButton = {
			id: 'image-upload',
			icon: <PlusIcon />,
			onClick: () => imageUploaderRef.current?.openFileDialog(),
			variant: 'ghost',
			'aria-label': __( 'Upload image', 'a8c-agenttic' ),
		};

		return [ uploadAction, ...( customActions || [] ) ];
	}, [ imageUploaderRef, customActions ] );

	// Default to stacked layout when image uploader is connected
	const resolvedLayout =
		layout ?? ( imageUploaderRef ? 'stacked' : 'inline' );

	return (
		<ChatInput
			value={ inputValue }
			onChange={ setInputValue }
			onSubmit={ handleSubmit }
			onKeyDown={ onKeyDownHandler }
			onFocus={ onInputFocus }
			onBlur={ onInputBlur }
			textareaRef={ textareaRef }
			placeholder={ placeholder }
			isProcessing={ isProcessing }
			onStop={ onStop }
			fromCompact={ fromCompact }
			onExpand={ onExpand }
			showExpandButton={ showExpandButton }
			focusOnMount={ focusOnMount }
			disabled={ disabled }
			customActions={ resolvedActions }
			actionOrder={ actionOrder }
			className={ className }
			layout={ resolvedLayout }
		/>
	);
}
