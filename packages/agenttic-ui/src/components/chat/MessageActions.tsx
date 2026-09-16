import { cn } from '../../utils/classNames';
import { Button } from '../ui/button';
import styles from './MessageActions.module.css';
import type { Message, MessageAction } from '../../types';

interface MessageActionsProps {
	message: Message;
	actions?: MessageAction[];
}

export function MessageActions( { message, actions: actionsProp }: MessageActionsProps ) {
	const actions = actionsProp || message.actions;

	if ( ! actions || actions.length === 0 ) {
		return null;
	}

	const renderAction = ( action: MessageAction ) => {
		if ( action.type === 'component' ) {
			const ActionComponent = action.component;
			const element = <ActionComponent key={ action.id } { ...( action.componentProps || {} ) } />;
			// Inline components stay direct flex items (some span the row); in the
			// panel the wrapper keeps a component's control aligned with the buttons.
			if ( ! action.revealOnHover ) {
				return element;
			}
			return (
				<span key={ action.id } className={ styles.componentWrapper }>
					{ element }
				</span>
			);
		}
		return (
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
	};

	// Hover-only actions share one panel that floats below the message; once one
	// of them is pressed the panel docks, settling into the flow as a plain row.
	const inlineActions = actions.filter( ( action ) => ! action.revealOnHover );
	const hoverOnlyActions = actions.filter( ( action ) => action.revealOnHover );
	const isDocked = hoverOnlyActions.some(
		( action ) => action.type !== 'component' && action.pressed
	);

	return (
		<div
			className={ styles.container }
			data-visible="true"
			role="toolbar"
			aria-label="Message actions"
		>
			{ inlineActions.map( renderAction ) }
			{ hoverOnlyActions.length > 0 && (
				<div className={ cn( styles.dock, isDocked ? styles.docked : undefined ) }>
					<div className={ styles.dockInner }>
						<div className={ styles.floating }>{ hoverOnlyActions.map( renderAction ) }</div>
					</div>
				</div>
			) }
		</div>
	);
}
