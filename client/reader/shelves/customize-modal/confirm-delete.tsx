import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	shelfName: string;
	isDeleting: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * Confirmation step for the hard delete. Deletion has no trash/undo, so the
 * destructive action is gated behind this separate dialog rather than firing
 * straight from the editor.
 */
export function ConfirmDeleteDialog( { shelfName, isDeleting, onConfirm, onCancel }: Props ) {
	const translate = useTranslate();

	return (
		<Modal
			title={ translate( 'Delete shelf' ) }
			size="small"
			onRequestClose={ onCancel }
			className="customize-shelf-modal__confirm-delete"
		>
			<VStack spacing={ 4 }>
				<p>
					{ translate(
						'This permanently deletes {{strong}}%(shelfName)s{{/strong}} and can’t be undone. Your subscriptions are not affected.',
						{
							args: { shelfName },
							components: { strong: <strong /> },
						}
					) }
				</p>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						disabled={ isDeleting }
						onClick={ onCancel }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isDestructive
						isBusy={ isDeleting }
						disabled={ isDeleting }
						onClick={ onConfirm }
					>
						{ translate( 'Delete shelf' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
