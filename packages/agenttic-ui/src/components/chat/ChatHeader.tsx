import { Button } from '../ui/button';
import { XIcon } from '../icons/XIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
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
			{ onMinimize && (
				<Button
					variant="ghost"
					icon={ <ChevronDownIcon /> }
					onClick={ onMinimize }
					aria-label="Minimize conversation"
				/>
			) }
			{ onClose && (
				<Button
					variant="ghost"
					icon={ <XIcon /> }
					onClick={ onClose }
					aria-label="Close conversation"
				/>
			) }
		</div>
	);
}
