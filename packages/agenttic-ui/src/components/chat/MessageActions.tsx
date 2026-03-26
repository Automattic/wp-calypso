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

	const buttonActions = message.actions.filter(
		( action ): action is Extract< MessageAction, { type?: 'button' } > =>
			action.type !== 'component'
	);
	const componentActions = message.actions.filter(
		( action ): action is Extract< MessageAction, { type: 'component' } > =>
			action.type === 'component'
	);

	return (
		<div
			className={ styles.container }
			data-visible="true"
			role="toolbar"
			aria-label="Message actions"
		>
			{ buttonActions.map( ( action ) => (
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
			) ) }
			{ componentActions.map( ( action ) => {
				const ActionComponent = action.component;
				return (
					<ActionComponent
						key={ action.id }
						{ ...( action.componentProps || {} ) }
					/>
				);
			} ) }
		</div>
	);
}
