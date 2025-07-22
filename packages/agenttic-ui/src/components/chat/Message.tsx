import React from 'react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import type { Message as MessageType } from '../../types';
import { fadeVariants } from '../animations';
import { cn } from '../../utils/utils';
import styles from './Message.module.css';

interface MessageProps {
	message: MessageType;
}

export const Message = React.forwardRef< HTMLDivElement, MessageProps >(
	function Message( { message }, ref ) {
		const renderMessageContent = () => {
			return (
				<>
					{ message.content.map( ( contentBlock, index ) => {
						if (
							contentBlock.type === 'text' &&
							contentBlock.text
						) {
							return (
								<Markdown key={ index }>
									{ contentBlock.text }
								</Markdown>
							);
						}
						if (
							contentBlock.type === 'component' &&
							contentBlock.component
						) {
							const Component = contentBlock.component;
							return (
								<Component
									key={ index }
									{ ...( contentBlock.componentProps || {} ) }
								/>
							);
						}
						return null;
					} ) }
				</>
			);
		};

		return (
			<motion.div
				ref={ ref }
				variants={ fadeVariants }
				initial="hidden"
				animate="visible"
				data-slot="message"
				data-role={ message.role }
				className={ cn( styles.message, styles[ message.role ] ) }
			>
				<div className={ styles.content }>
					<div className={ styles.bubble }>
						{ renderMessageContent() }
					</div>
				</div>
			</motion.div>
		);
	}
);
