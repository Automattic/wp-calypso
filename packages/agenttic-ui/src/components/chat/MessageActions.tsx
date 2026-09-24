import { cn } from '../../utils/classNames';
import { Button } from '../ui/button';
import styles from './MessageActions.module.css';
import type { Message, MessageAction } from '../../types';

interface MessageActionsProps {
	message: Message;
	actions?: MessageAction[];
	/** The message belongs to the turn after the user's latest message. */
	isLatestTurn?: boolean;
	/** Whether the latest reply is still streaming. */
	isStreaming?: boolean;
}

export function MessageActions( {
	message,
	actions: actionsProp,
	isLatestTurn = true,
	isStreaming = false,
}: MessageActionsProps ) {
	const actions = actionsProp || message.actions || [];

	// `latest-turn` actions wait for the latest turn to settle, so the row appears
	// at once; a pressed one stays. Earlier turns keep them in place, shown on
	// hover, or always once one of them is pressed.
	const isPressed = ( action: MessageAction ) => action.type !== 'component' && !! action.pressed;
	const isHoverOnly = ( action: MessageAction ) =>
		action.visibility === 'latest-turn' && ! isLatestTurn;
	const isHeldBack = ( action: MessageAction ) =>
		action.visibility === 'latest-turn' && isLatestTurn && isStreaming && ! isPressed( action );
	const visibleActions = actions.filter( ( action ) => ! isHeldBack( action ) );

	if ( visibleActions.length === 0 ) {
		return null;
	}

	const isPinned = visibleActions.some(
		( action ) => isHoverOnly( action ) && isPressed( action )
	);

	const renderAction = ( action: MessageAction ) => {
		const element =
			action.type === 'component' ? (
				<action.component key={ action.id } { ...( action.componentProps || {} ) } />
			) : (
				<Button
					key={ action.id }
					className={ styles.button }
					icon={ action.icon }
					onClick={ () => action.onClick( message ) }
					variant="ghost"
					size="sm"
					type="button"
					disabled={ action.disabled }
					pressed={ action.pressed }
					title={ action.tooltip || action.label }
					aria-label={ action.label }
					{ ...( action.tooltip && {
						title: action.tooltip,
					} ) }
				>
					{ action.showLabel ? action.label : undefined }
				</Button>
			);

		// The wrapper fades, so an action's own opacity (a dimmed disabled button)
		// still applies. Others stay direct flex items, since some span the row.
		return isHoverOnly( action ) ? (
			<span key={ action.id } className={ styles.hoverOnly }>
				{ element }
			</span>
		) : (
			element
		);
	};

	return (
		<div
			className={ cn( styles.container, { [ styles.pinned ]: isPinned } ) }
			data-visible="true"
			role="toolbar"
			aria-label="Message actions"
		>
			{ visibleActions.map( renderAction ) }
		</div>
	);
}
