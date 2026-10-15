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
	// at once; a pressed one stays. On earlier turns they share one panel that
	// floats below the message; once one of them is pressed the panel docks,
	// settling into the flow as a plain row.
	const isPressed = ( action: MessageAction ) => action.type !== 'component' && !! action.pressed;
	const isHoverOnly = ( action: MessageAction ) =>
		action.visibility === 'latest-turn' && ! isLatestTurn;
	const isHeldBack = ( action: MessageAction ) =>
		action.visibility === 'latest-turn' && isLatestTurn && isStreaming && ! isPressed( action );
	const visibleActions = actions.filter( ( action ) => ! isHeldBack( action ) );

	if ( visibleActions.length === 0 ) {
		return null;
	}

	const inlineActions = visibleActions.filter( ( action ) => ! isHoverOnly( action ) );
	const hoverOnlyActions = visibleActions.filter( isHoverOnly );
	const isDocked = hoverOnlyActions.some( isPressed );

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

		// In the panel the wrapper keeps a component's control aligned with the
		// buttons. Inline components stay direct flex items, since some span the row.
		return action.type === 'component' && isHoverOnly( action ) ? (
			<span key={ action.id } className={ styles.componentWrapper }>
				{ element }
			</span>
		) : (
			element
		);
	};

	return (
		<div
			className={ styles.container }
			data-visible="true"
			role="toolbar"
			aria-label="Message actions"
		>
			{ inlineActions.map( renderAction ) }
			{ hoverOnlyActions.length > 0 && (
				<div className={ cn( styles.dock, { [ styles.docked ]: isDocked } ) }>
					<div className={ styles.dockInner }>
						<div className={ styles.floating }>{ hoverOnlyActions.map( renderAction ) }</div>
					</div>
				</div>
			) }
		</div>
	);
}
