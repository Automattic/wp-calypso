import { __experimentalVStack as VStack, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../../../components/button-stack';
import { Text } from '../../../../components/text';

export function MigrationCancellation( {
	onConfirm,
	disabled,
}: {
	onConfirm: () => void;
	disabled: boolean;
} ) {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<>
			<Button
				__next40pxDefaultSize
				variant="link"
				className="wordpress-migration__note-link"
				disabled={ disabled }
				onClick={ () => setIsOpen( true ) }
			>
				{ __( 'Cancel this migration' ) }
			</Button>
			{ isOpen && (
				<Modal
					title={ __( 'Cancel migration' ) }
					onRequestClose={ () => setIsOpen( false ) }
					size="medium"
				>
					<VStack spacing={ 6 }>
						<Text>
							{ __(
								'Cancel this migration and return to your site dashboard? Your plan and domain stay active.'
							) }
						</Text>
						<ButtonStack justify="flex-end">
							<Button __next40pxDefaultSize variant="tertiary" onClick={ () => setIsOpen( false ) }>
								{ __( 'Keep migrating' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								disabled={ disabled }
								onClick={ () => {
									setIsOpen( false );
									onConfirm();
								} }
							>
								{ __( 'Cancel migration' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</>
	);
}
