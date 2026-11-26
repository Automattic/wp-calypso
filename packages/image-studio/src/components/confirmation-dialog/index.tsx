/**
 * WordPress dependencies
 */
import {
	Button,
	Flex,
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ActionButton {
	text: string;
	onClick: () => void | Promise< void >;
	variant?: ButtonVariant;
	isDestructive?: boolean;
}

interface ConfirmationDialogProps {
	isOpen: boolean;
	title?: string;
	children: React.ReactNode;
	actions: ActionButton[];
	/**
	 * Handler for dialog dismissal (ESC key, backdrop click, X button)
	 * If not provided, dialog is not dismissible
	 */
	onClose?: () => void;
}

/**
 * Confirmation dialog component.
 *
 * An alternative to WordPress's ConfirmDialog that supports
 * multiple action buttons.
 *
 * Features:
 * - Supports multiple action buttons
 * - Button styles: primary, secondary, tertiary, destructive
 * - Dismissible behavior can be disabled (ESC/backdrop/X button)
 * - Layout adapts for mobile devices
 *
 * Example usage:
 * ```tsx
 * <ConfirmationDialog
 * isOpen={showDialog}
 * title="Unsaved changes"
 * actions={[
 * { text: 'Cancel', onClick: handleCancel, variant: 'tertiary' },
 * { text: 'Discard', onClick: handleDiscard, variant: 'secondary', isDestructive: true },
 * { text: 'Save', onClick: handleSave, variant: 'primary' }
 * ]}
 * onClose={handleCancel}
 * >
 * What would you like to do with your changes?
 * </ConfirmationDialog>
 * ```
 * @param {ConfirmationDialogProps} props          - Component props.
 * @param {boolean}                 props.isOpen   - Whether the dialog is open.
 * @param {string}                  props.title    - Dialog title (optional).
 * @param {*}                       props.children - Dialog message/content.
 * @param {ActionButton[]}          props.actions  - Array of action buttons to display.
 * @param {Function}                props.onClose  - Handler for dialog dismissal (optional).
 * @returns The confirmation dialog component or null if not open.
 */
export function ConfirmationDialog( props: ConfirmationDialogProps ) {
	const { isOpen, title, children, actions, onClose } = props;
	const firstButtonRef = useRef< HTMLButtonElement >( null );

	// Focus the first button when dialog opens for proper keyboard navigation
	useEffect( () => {
		if ( isOpen && firstButtonRef.current ) {
			firstButtonRef.current.focus();
		}
	}, [ isOpen ] );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			overlayClassName="image-studio-confirmation-dialog-overlay"
			onRequestClose={ onClose || ( () => {} ) }
			title={ title }
			closeButtonLabel={ title }
			isDismissible={ !! onClose }
		>
			<VStack spacing={ 8 } className="image-studio-confirmation-dialog-content">
				<Text>{ children }</Text>
				<Flex direction="row" justify="flex-end">
					{ actions.map( ( action, index ) => (
						<Button
							key={ `action-${ action.text.toLowerCase().replace( /\s+/g, '-' ) }` }
							ref={ index === 0 ? firstButtonRef : null }
							__next40pxDefaultSize
							variant={ action.variant || 'secondary' }
							isDestructive={ action.isDestructive }
							onClick={ action.onClick }
						>
							{ action.text }
						</Button>
					) ) }
				</Flex>
			</VStack>
		</Modal>
	);
}
