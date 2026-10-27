import {
	Button,
	Modal,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';

/**
 * Shows the message before it goes on the clipboard. Read-only, like the
 * code field, and still selectable.
 */
export default function CertificationShareModal( {
	message,
	onCopy,
	onClose,
}: {
	message: string;
	onCopy: () => void;
	onClose: () => void;
} ) {
	return (
		<Modal title={ __( 'Share with your team' ) } size="medium" onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Message' ) }
					help={ __( 'Paste it into a chat or email.' ) }
					value={ message }
					onChange={ () => {} }
					readOnly
					rows={ 8 }
					style={ { resize: 'none' } }
				/>
				<ButtonStack justify="flex-end">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" onClick={ onCopy }>
						{ __( 'Copy message' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
