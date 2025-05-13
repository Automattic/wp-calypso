import type { useFocusOnMount } from '@wordpress/compose';
import type { ReactElement } from 'react';

interface ActionBase {
	/**
	 * The label of the action.
	 * In case we want to adjust the label based on the selected items,
	 * a function can be provided.
	 */
	label: string;

	/**
	 * Indicates activity while a action is being performed.
	 */
	isBusy?: boolean;

	/**
	 * Whether the action is disabled.
	 */
	disabled?: boolean;

	/**
	 * Whether the action is destructive.
	 */
	isDestructive?: boolean;
}

export interface RenderModalProps {
	closeModal?: () => void;
}

export interface ActionModal extends ActionBase {
	/**
	 * Modal to render when the action is triggered.
	 */
	RenderModal: ( { closeModal }: RenderModalProps ) => ReactElement;

	/**
	 * Whether to hide the modal header.
	 */
	hideModalHeader?: boolean;

	/**
	 * The header of the modal.
	 */
	modalHeader?: string;

	/**
	 * The size of the modal.
	 *
	 * @default 'medium'
	 */
	modalSize?: 'small' | 'medium' | 'large' | 'fill';

	/**
	 * The focus on mount property of the modal.
	 */
	modalFocusOnMount?: Parameters< typeof useFocusOnMount >[ 0 ] | 'firstContentElement';
}

export interface ActionButton extends ActionBase {
	/**
	 * The callback to execute when the action is triggered.
	 */
	callback: () => void;
}

export type Action = ActionModal | ActionButton;

export interface ActionItemModalProps {
	action: ActionModal;
	closeModal: () => void;
}

export interface ActionItemProps {
	/**
	 * The main label that identifies the action.
	 */
	title: string;
	/**
	 * Optional supporting text that provides additional context or detail about the action.
	 */
	description?: string;
	/**
	 * An optional visual element such as an icon or small illustration to enhance
	 * visual context or reinforce the category.
	 */
	decoration?: React.ReactElement;
	/**
	 * The action to be performed.
	 */
	action: Action;
}
