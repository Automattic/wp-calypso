import {
	Button,
	Modal,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';

/**
 * The message before it goes on the clipboard, editable so the owner can add
 * a greeting or a deadline of their own.
 */
export default function CertificationShareModal( {
	message: initialMessage,
	onCopy,
	onClose,
}: {
	message: string;
	onCopy: ( message: string ) => void;
	onClose: () => void;
} ) {
	const [ message, setMessage ] = useState( initialMessage );

	return (
		<Modal
			title={ __( 'Share with your team' ) }
			size="medium"
			focusOnMount="firstContentElement"
			onRequestClose={ onClose }
		>
			<VStack spacing={ 6 }>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Message' ) }
					help={ __( 'Paste it into Slack or email. You can edit it first.' ) }
					value={ message }
					onChange={ setMessage }
					rows={ 8 }
				/>
				<ButtonStack justify="flex-end">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" onClick={ () => onCopy( message ) }>
						{ __( 'Copy message' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
