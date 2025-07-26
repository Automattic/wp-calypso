import type {
	MessageActionsRegistration,
	UIMessage,
	UIMessageAction,
} from '../react/useAgentChat';

/**
 * Resolves message actions for a specific message
 * Evaluates dynamic conditions and filters out actions
 * @param message
 * @param registrations
 */
export function resolveActionsForMessage(
	message: UIMessage,
	registrations: MessageActionsRegistration[]
): UIMessageAction[] {
	const allActions = registrations.flatMap( ( reg ) => {
		// Handle dynamic actions (function that returns actions)
		if ( typeof reg.actions === 'function' ) {
			return reg.actions( message );
		}
		return reg.actions;
	} );

	const filteredActions = allActions
		.filter( ( action ) => {
			if ( action.condition && ! action.condition( message ) ) {
				return false;
			}
			return true;
		} )
		.map( ( action ) => ( {
			id: action.id,
			label: action.label,
			icon: action.icon,
			onClick: action.onClick,
			tooltip: action.tooltip,
			disabled: action.disabled || false,
		} ) );
	return filteredActions;
}
