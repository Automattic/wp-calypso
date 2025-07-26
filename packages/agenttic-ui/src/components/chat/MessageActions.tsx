import type { Message, MessageAction } from '../../types';
import { Button } from '../ui/button';
import styles from './MessageActions.module.css';

interface MessageActionsProps {
	message: Message;
}

export function MessageActions( { message }: MessageActionsProps ) {
	if ( ! message.actions || message.actions.length === 0 ) {
		return null;
	}

	return (
		<div
			className={ styles.container }
			data-visible="true"
			role="toolbar"
			aria-label="Message actions"
		>
			{ message.actions.map( ( action: MessageAction ) => {
				return (
					<Button
						key={ action.id }
						className={ styles.button }
						icon={ action.icon }
						onClick={ () => action.onClick( message ) }
						variant="tertiary"
						size="icon"
						type="button"
						disabled={ action.disabled }
						title={ action.tooltip || action.label }
						aria-label={ action.label }
						{ ...( action.tooltip && { title: action.tooltip } ) }
					/>
				);
			} ) }
		</div>
	);
}
