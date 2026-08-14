import { __ } from '@wordpress/i18n';
import { motion } from 'framer-motion';
import { fastSpring } from '../animations';
import { XIcon } from '../icons/XIcon';
import { Button } from '../ui/button';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
	onClose?: () => void;
	className?: string;
}

// TODO: `className` is accepted but never applied — apply or drop it (tracked follow-up).
export function ChatHeader( { onClose }: ChatHeaderProps ) {
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
