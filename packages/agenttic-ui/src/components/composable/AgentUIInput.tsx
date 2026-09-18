import { __ } from '@wordpress/i18n';
import React, { useMemo } from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { type ActionButton, ActionButtons, ChatInput } from '../chat/ChatInput';
import { PlusIcon } from '../icons/PlusIcon';
import type { TrailingActions } from '../../types';
import type { ImageUploaderHandle } from '../chat/ImageUploader';

export interface AgentUIInputProps {
	className?: string;
	disabled?: boolean;
	// Locks the textarea without disabling the submit/stop button
	readOnly?: boolean;
	// Pinned to the start of the actions row, after the upload button when one
	// is connected. Defaults to the container's `leadingActions`.
	leadingActions?: React.ReactNode;
	// Grouped with the submit button; a function receives it and decides the
	// order. Defaults to the container's `trailingActions`.
	trailingActions?: TrailingActions;
	// Legacy: prefer leadingActions / trailingActions
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onKeyDown?: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	layout?: 'inline' | 'stacked';
	imageUploaderRef?: React.RefObject< ImageUploaderHandle | null >;
	// Disables the "+" upload action (e.g. while an upload is in flight)
	imageUploadDisabled?: boolean;
}

export function AgentUIInput( {
	className,
	disabled,
	readOnly,
	leadingActions,
	trailingActions,
	customActions,
	actionOrder,
	onKeyDown,
	layout,
	imageUploaderRef,
	imageUploadDisabled,
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
		leadingActions: contextLeadingActions,
		trailingActions: contextTrailingActions,
	} = useAgentUIContext();

	const resolvedTrailingActions = trailingActions ?? contextTrailingActions;
	const hostLeadingActions = leadingActions ?? contextLeadingActions;

	const onKeyDownHandler = ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
		onKeyDown?.( e );

		if ( e.defaultPrevented ) {
			return;
		}

		handleKeyDown( e );
	};

	// When imageUploaderRef is provided, a "+" button leads the actions row
	const resolvedLeadingActions = useMemo( () => {
		if ( ! imageUploaderRef ) {
			return hostLeadingActions;
		}

		const uploadAction: ActionButton = {
			id: 'image-upload',
			icon: <PlusIcon />,
			onClick: () => imageUploaderRef.current?.openFileDialog(),
			variant: 'ghost',
			disabled: imageUploadDisabled,
			'aria-label': __( 'Upload image', 'a8c-agenttic' ),
		};

		return (
			<>
				<ActionButtons actions={ [ uploadAction ] } />
				{ hostLeadingActions }
			</>
		);
	}, [ imageUploaderRef, hostLeadingActions, imageUploadDisabled ] );

	// Default to stacked layout when image uploader is connected
	const resolvedLayout = layout ?? ( imageUploaderRef ? 'stacked' : 'inline' );

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
			readOnly={ readOnly }
			leadingActions={ resolvedLeadingActions }
			trailingActions={ resolvedTrailingActions }
			customActions={ customActions }
			actionOrder={ actionOrder }
			className={ className }
			layout={ resolvedLayout }
		/>
	);
}
