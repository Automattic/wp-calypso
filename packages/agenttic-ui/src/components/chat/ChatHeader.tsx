import { Button } from '../ui/button';
import { X } from 'lucide-react';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
	onClose?: () => void;
}

export function ChatHeader( { onClose }: ChatHeaderProps ) {
	return (
		<div data-slot="chat-header" className={ styles.container }>
			<Button
				variant="tertiary"
				size="icon"
				icon={ <X /> }
				iconSize="sm"
				onClick={ onClose }
				aria-label="Close conversation"
			/>
		</div>
	);
}
