import { Modal, Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRef } from 'react';
import { Text } from '../../components/text';
import { ButtonStack } from '../button-stack';
import type { ButtonProps } from '@wordpress/components/build-types/button/types';

interface Props {
	__experimentalHideHeader?: boolean;
	title?: string;
	size?: 'small' | 'medium' | 'large';
	cancelButtonText?: string;
	confirmButtonProps: ButtonProps;
	children: React.ReactNode;
	isOpen: boolean;
	isDismissible?: boolean;
	onCancel: () => void;
	onConfirm?: () => void;
}

export default function ConfirmModal( {
	__experimentalHideHeader = true,
	title,
	size = 'large',
	cancelButtonText,
	confirmButtonProps,
	children,
	isOpen,
	isDismissible = true,
	onCancel,
	onConfirm,
}: Props ) {
	const cancelButtonRef = useRef();
	const confirmButtonRef = useRef();

	const handleOnConfirm = () => {
		onConfirm?.();
	};

	if ( ! isOpen ) {
		return null;
	}

	const closeButtonLabel = cancelButtonText ?? __( 'Cancel' );

	const handleEnter = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		// Avoid triggering the 'confirm' action when a button is focused,
		// as this can cause a wrong action to be performed.
		const isConfirmOrCancelButton =
			event.target === cancelButtonRef.current || event.target === confirmButtonRef.current;

		if ( ! isConfirmOrCancelButton && event.key === 'Enter' ) {
			onConfirm?.();
		}
	};

	return (
		<Modal
			__experimentalHideHeader={ __experimentalHideHeader }
			title={ title }
			size={ size }
			closeButtonLabel={ closeButtonLabel }
			isDismissible={ isDismissible }
			onKeyDown={ handleEnter }
			onRequestClose={ onCancel }
		>
			<VStack spacing={ 8 }>
				<Text>{ children }</Text>
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ onCancel }
						ref={ cancelButtonRef }
						disabled={ confirmButtonProps?.isBusy }
					>
						{ closeButtonLabel }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ handleOnConfirm }
						isBusy={ confirmButtonProps?.isBusy }
						disabled={ confirmButtonProps?.disabled }
						ref={ confirmButtonRef }
					>
						{ confirmButtonProps.label }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
