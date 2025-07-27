import { Button } from '../ui/button';
import { ChevronDown, X } from 'lucide-react';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
	onClose?: () => void;
	onMinimize?: () => void;
}

export function ChatHeader( { onClose, onMinimize }: ChatHeaderProps ) {
	return (
		<div
			data-slot="chat-header"
			data-draggable="true"
			className={ styles.container }
		>
			{ onClose && (
				<Button
					variant="tertiary"
					size="icon"
					icon={ <X /> }
					iconSize="sm"
					onClick={ onClose }
					aria-label="Clear conversation history"
				/>
			) }
			{ onMinimize && (
				<Button
					variant="tertiary"
					size="icon"
					icon={ <ChevronDown /> }
					iconSize="sm"
					onClick={ onMinimize }
					aria-label="Minimize conversation"
				/>
			) }
		</div>
	);
}
