import { useCallback } from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { Checklist, type ChecklistProps } from '../chat/Checklist';
import type { ChecklistItem } from '../../types';

export interface AgentUIChecklistProps extends Omit< ChecklistProps, 'onSubmit' > {
	/** Called once an item's prompt has been sent, so the host can mark the task as started. */
	onSelect?: ( selectedItem: ChecklistItem ) => void;
}

/**
 * Checklist wired to the container: a selected item goes through the same
 * submit path as a suggestion (`autoSubmit`, `beforeSubmit`, click reporting).
 * Meant to be rendered inside a message as a `component` content block.
 * @param props          Component props.
 * @param props.onSelect Called with the selected item once its prompt is sent.
 */
export function AgentUIChecklist( { onSelect, ...props }: AgentUIChecklistProps ) {
	const { handleSuggestionSubmit, isProcessing } = useAgentUIContext();

	const handleSubmit = useCallback(
		( selectedItem: ChecklistItem, items: ChecklistItem[] ): boolean => {
			// A blocked send, or a prompt that merely lands in the composer, leaves
			// the item open so the user can try again.
			const sent = handleSuggestionSubmit( selectedItem, items ) === true;
			if ( ! sent ) {
				return false;
			}
			try {
				onSelect?.( selectedItem );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( 'Checklist onSelect callback failed:', error );
			}
			return true;
		},
		[ onSelect, handleSuggestionSubmit ]
	);

	return <Checklist { ...props } busy={ props.busy || isProcessing } onSubmit={ handleSubmit } />;
}
