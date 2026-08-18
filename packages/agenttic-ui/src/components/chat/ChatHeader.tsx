import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { XIcon } from '../icons/XIcon';
import { fastSpring } from '../animations';
import styles from './ChatHeader.module.css';
import { __ } from '@wordpress/i18n';

interface ChatHeaderProps {
	onClose?: () => void;
	className?: string;
}

export function ChatHeader( { onClose, className }: ChatHeaderProps ) {
	return (
		<motion.div
			data-slot="chat-header"
			data-draggable="true"
			className={ styles.container }
			initial={ { opacity: 0 } }
			animate={ { opacity: 1 } }
			transition={ { ...fastSpring, delay: 0.1 } }
		>
			{ onClose && (
				<Button
					variant="ghost"
					icon={ <XIcon /> }
					onClick={ onClose }
					aria-label={ __( 'Close conversation', 'a8c-agenttic' ) }
				/>
			) }
		</motion.div>
	);
}
