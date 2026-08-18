import type { Message, MessageAction } from '../../types';
import { Button } from '../ui/button';
import styles from './MessageActions.module.css';

interface MessageActionsProps {
	message: Message;
	actions?: MessageAction[];
}

export function MessageActions( {
	message,
	actions: actionsProp,
}: MessageActionsProps ) {
	const actions = actionsProp || message.actions;

	if ( ! actions || actions.length === 0 ) {
		return null;
	}

	return (
		<div
			className={ styles.container }
			data-visible="true"
			role="toolbar"
			aria-label="Message actions"
		>
			{ actions.map( ( action: MessageAction ) => {
				if ( action.type === 'component' ) {
					const ActionComponent = action.component;
					return (
						<ActionComponent
							key={ action.id }
							{ ...( action.componentProps || {} ) }
						/>
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
			} ) }
		</div>
	);
}
