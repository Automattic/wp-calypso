import { useI18n } from '@wordpress/react-i18n';
import { Button, Dialog } from '@wordpress/ui';
import { useRef } from 'react';
import type { NamePulsePolicyNotice } from '../hooks/use-name-pulse-cart-toggle';

interface NamePulsePolicyNoticeDialogProps {
	notice: NamePulsePolicyNotice;
	open: boolean;
	isPending: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

/**
 * Confirms a TLD's special requirements before the name goes to the cart, and
 * stays open until it is there.
 */
export const NamePulsePolicyNoticeDialog = ( {
	notice,
	open,
	isPending,
	onConfirm,
	onClose,
}: NamePulsePolicyNoticeDialogProps ) => {
	const { __ } = useI18n();
	const popupRef = useRef< HTMLDivElement >( null );

	return (
		<Dialog.Root open={ open } onOpenChange={ ( isOpen ) => ! isOpen && onClose() }>
			<Dialog.Popup size="small" ref={ popupRef } initialFocus={ popupRef }>
				<Dialog.Header>
					<Dialog.Title>{ notice.title }</Dialog.Title>
					<Dialog.CloseIcon />
				</Dialog.Header>
				<Dialog.Content>
					<Dialog.Description>{ notice.message }</Dialog.Description>
				</Dialog.Content>
				<Dialog.Footer>
					<Dialog.Action variant="minimal" disabled={ isPending }>
						{ __( 'Cancel' ) }
					</Dialog.Action>
					<Button loading={ isPending } onClick={ onConfirm }>
						{ __( 'Add to cart' ) }
					</Button>
				</Dialog.Footer>
			</Dialog.Popup>
		</Dialog.Root>
	);
};
