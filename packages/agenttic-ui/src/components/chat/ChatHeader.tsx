import { Button } from '../ui/button';
import { XIcon } from '../icons/XIcon';
import styles from './ChatHeader.module.css';
import { __ } from '@wordpress/i18n';

interface ChatHeaderProps {
	onClose?: () => void;
}

export function ChatHeader( { onClose }: ChatHeaderProps ) {
	return (
		<div
			data-slot="chat-header"
			data-draggable="true"
			className={ styles.container }
		>
			{ onClose && (
				<Button
					variant="ghost"
					icon={ <XIcon /> }
					onClick={ onClose }
					aria-label={ __( 'Close conversation', 'a8c-agenttic' ) }
				/>
			) }
		</div>
	);
}
