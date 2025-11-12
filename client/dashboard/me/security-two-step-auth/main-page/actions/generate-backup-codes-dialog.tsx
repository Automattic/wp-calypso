import { __experimentalVStack as VStack, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { securityTwoStepAuthBackupCodesRoute } from '../../../../app/router/me';
import { ButtonStack } from '../../../../components/button-stack';
import RouterLinkButton from '../../../../components/router-link-button';
import { Text } from '../../../../components/text';

export default function GenerateBackupCodesDialog( { onClose }: { onClose: () => void } ) {
	return (
		<Modal size="medium" title={ __( 'Generate new backup codes' ) } onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text>
					{ __(
						'When you generate new backup codes, you must print or download the new codes. Your previous codes will no longer work.'
					) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<RouterLinkButton
						__next40pxDefaultSize
						variant="primary"
						to={ securityTwoStepAuthBackupCodesRoute.fullPath }
					>
						{ __( 'Continue' ) }
					</RouterLinkButton>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
