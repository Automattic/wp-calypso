import type { MessageActionsRegistration, UIMessage, UIMessageAction } from '../react/useAgentChat';

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
		.map( ( action ): UIMessageAction => {
			if ( action.type === 'component' ) {
				return {
					type: 'component',
					id: action.id,
					label: action.label,
					component: action.component,
					componentProps: action.componentProps,
					order: action.order,
				};
			}
			return {
				id: action.id,
				label: action.label,
				icon: action.icon,
				onClick: action.onClick,
				tooltip: action.tooltip,
				disabled: action.disabled || false,
				pressed: action.pressed,
				showLabel: action.showLabel,
				order: action.order,
			};
		} )
		.sort( ( a, b ) => ( a.order ?? Infinity ) - ( b.order ?? Infinity ) );
	return filteredActions;
}
