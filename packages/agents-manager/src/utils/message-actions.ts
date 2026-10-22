import type { UIMessageAction } from '@automattic/agenttic-client';

export const CHECKPOINT_ACTION_ID = 'checkpoint';
export const COPY_ACTION_ID = 'copy';
export const REGENERATE_ACTION_ID = 'regenerate';

// Actions the chat computes on every render; a registered copy is replaced, not duplicated.
function isComputedAction( action: UIMessageAction ): boolean {
	return (
		action.id === CHECKPOINT_ACTION_ID ||
		action.id.startsWith( 'feedback-' ) ||
		action.id === COPY_ACTION_ID ||
		action.id === REGENERATE_ACTION_ID
	);
}

export function hasCheckpointAction( actions: UIMessageAction[] | undefined ): boolean {
	return !! actions?.some( ( action ) => action.id === CHECKPOINT_ACTION_ID );
}

export function hasDisabledCheckpointAction( actions: UIMessageAction[] ): boolean {
	return actions.some(
		( action ) =>
			action.type === 'component' &&
			action.id === CHECKPOINT_ACTION_ID &&
			action.componentProps?.disabled === true
	);
}

/** Replaces a message's computed actions with fresh ones, sorted by `order`. */
export function withComputedActions< Message extends { actions?: UIMessageAction[] } >(
	message: Message,
	computedActions: UIMessageAction[]
): Message {
	// A registered checkpoint action is stale once availability returns none, so it
	// is still stripped.
	if ( computedActions.length === 0 && ! hasCheckpointAction( message.actions ) ) {
		return message;
	}

	const registeredActions = message.actions?.filter( ( action ) => ! isComputedAction( action ) );

	return {
		...message,
		actions: [ ...( registeredActions ?? [] ), ...computedActions ].sort(
			( actionA, actionB ) => ( actionA.order ?? Infinity ) - ( actionB.order ?? Infinity )
		),
	};
}

/**
 * Disables a message's actions, such as once its interactive UI is stale. Component actions get a
 * `disabled` prop, which those that change something, like the checkpoint, honor.
 */
export function withDisabledActions< Message extends { actions?: UIMessageAction[] } >(
	message: Message
): Message {
	if ( ! message.actions?.length ) {
		return message;
	}

	return {
		...message,
		actions: message.actions.map( ( action ) =>
			action.type === 'component'
				? { ...action, componentProps: { ...action.componentProps, disabled: true } }
				: { ...action, disabled: true }
		),
	};
}
