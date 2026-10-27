import { useAgentChat, type UseAgentChatConfig } from '@automattic/agenttic-client';
import { RegenerateIcon } from '@automattic/agenttic-ui';
import { Button, TextareaControl, TextControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAgentConfig } from '../../hooks/use-agent-config';
import { useErrorNotice } from '../../hooks/use-error-notice';
import { store as imageStudioStore } from '../../store';
import { ImageStudioMode, type MetadataField } from '../../types';
import { defaultAgentConfigFactory } from '../../utils/agent-config';
import { trackImageStudioGenAIButtonClick } from '../../utils/tracking';
import type { AiCreditsState } from '../../hooks/use-ai-credits';
import './editable-field.scss';

/** The chat's credits handlers, so a regeneration updates and respects the same balance. */
export type RegenerateCredits = Pick< AiCreditsState, 'onTaskUpdate' | 'beforeSubmit' >;

interface GenAIButtonProps {
	agentConfigState: UseAgentChatConfig;
	prompt: string;
	setProcessing: ( processing: boolean ) => void;
	field: MetadataField;
	attachmentId?: number;
	credits?: RegenerateCredits;
}

function GenAIButton( {
	agentConfigState,
	prompt,
	setProcessing,
	field,
	attachmentId,
	credits,
}: GenAIButtonProps ) {
	// A regeneration is an Agent turn, so its last update carries the new balance.
	const agentChatProps = useAgentChat( {
		...agentConfigState,
		onTaskUpdate: ( update ) => {
			credits?.onTaskUpdate( update );
			return agentConfigState.onTaskUpdate?.( update );
		},
	} );
	const { addNotice } = useDispatch( imageStudioStore );

	useEffect( () => {
		setProcessing( agentChatProps.isProcessing );
	}, [ agentChatProps.isProcessing, setProcessing ] );

	// Metadata fields always operate on an existing attachment.
	useErrorNotice( agentChatProps.error, addNotice, ImageStudioMode.Edit );

	const handleClick = () => {
		// At zero credits this opens the credits details instead, as Send does.
		if ( credits && ! credits.beforeSubmit() ) {
			return;
		}

		// Track the GenAI button click
		trackImageStudioGenAIButtonClick( {
			field,
			attachmentId,
		} );

		// Submit the prompt
		agentChatProps.onSubmit?.( prompt );
	};

	return (
		<Button
			icon={ <RegenerateIcon /> }
			label={ __( 'Regenerate', __i18n_text_domain__ ) }
			onClick={ handleClick }
			size="small"
			disabled={ agentChatProps.isProcessing }
		/>
	);
}

interface EditableFieldProps {
	label: string;
	value: string;
	onSave: ( value: string ) => void | Promise< void >;
	isTextarea?: boolean;
	disabled?: boolean;
	field: MetadataField;
	attachmentId?: number;
	credits?: RegenerateCredits;
}

export function EditableField( {
	label,
	value,
	onSave,
	isTextarea = false,
	disabled = false,
	field,
	attachmentId,
	credits,
}: EditableFieldProps ) {
	const [ editedValue, setEditedValue ] = useState( value );
	const [ processing, setProcessing ] = useState( false );
	const agentConfigState = useAgentConfig( defaultAgentConfigFactory );
	const hasUpdatedMetadata = useSelect(
		( select ) => select( imageStudioStore ).getHasUpdatedMetadata(),
		[]
	);
	const setHasUpdatedMetadata = useDispatch( imageStudioStore ).setHasUpdatedMetadata;

	const fieldId = `image-studio-field-${ label.toLowerCase().replace( /\s+/g, '-' ) }`;

	// Sync editedValue with value prop (e.g. external updates).
	useEffect( () => {
		setEditedValue( value );
	}, [ value ] );

	const handleChange = ( newValue: string ) => {
		setEditedValue( newValue );

		if ( ! hasUpdatedMetadata ) {
			setHasUpdatedMetadata( true );
		}
	};

	const handleBlur = async () => {
		if ( editedValue === value ) {
			return;
		}
		await onSave( editedValue );
	};

	return (
		<div
			className={ `image-studio-editable-field ${
				processing ? 'image-studio-editable-field--shimmer' : ''
			}` }
		>
			<div className="image-studio-editable-field-header">
				<label htmlFor={ fieldId } className="image-studio-editable-field-label">
					{ label }
				</label>
				<div className="image-studio-editable-field-actions">
					{ agentConfigState && (
						<GenAIButton
							setProcessing={ setProcessing }
							agentConfigState={ agentConfigState }
							prompt={ `Generate a new ${ label.toLowerCase() } for this image` }
							field={ field }
							attachmentId={ attachmentId }
							credits={ credits }
						/>
					) }
				</div>
			</div>
			{ isTextarea ? (
				<TextareaControl
					id={ fieldId }
					value={ editedValue }
					onChange={ handleChange }
					onBlur={ handleBlur }
					disabled={ disabled || processing }
					__nextHasNoMarginBottom
				/>
			) : (
				<TextControl
					id={ fieldId }
					value={ editedValue }
					onChange={ handleChange }
					onBlur={ handleBlur }
					disabled={ disabled || processing }
					__nextHasNoMarginBottom
				/>
			) }
		</div>
	);
}
