import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRef } from 'react';
import { ButtonStack } from '../button-stack';
import type { ButtonProps } from '@wordpress/components/build-types/button/types';

interface Props {
	onCancel: () => void;
	title?: string;
	children: React.ReactNode;
	cancelButtonText?: string;
	confirmButtonProps: ButtonProps;
	onConfirm?: () => void;
	isOpen: boolean;
	__experimentalHideHeader?: boolean;
	isDismissible?: boolean;
}

export default function ConfirmModal( {
	onCancel,
	title,
	children,
	cancelButtonText,
	confirmButtonProps,
	onConfirm,
	isOpen,
	__experimentalHideHeader = true,
	isDismissible = true,
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
			isDismissible={ isDismissible }
			onKeyDown={ handleEnter }
			onRequestClose={ onCancel }
			closeButtonLabel={ closeButtonLabel }
			title={ title }
		>
			<VStack spacing={ 8 }>
				<Text>{ children }</Text>
				<ButtonStack justify="flex-end">
					<Button
						variant="tertiary"
						onClick={ onCancel }
						ref={ cancelButtonRef }
						disabled={ confirmButtonProps?.isBusy }
					>
						{ closeButtonLabel }
					</Button>
					<Button
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
