import { motion } from 'framer-motion';
import React from 'react';
import type { Message as MessageType } from '../../types';
import { cn } from '../../utils/utils';
import { fadeVariants } from '../animations';
import { ParseMarkdown } from '../ParseMarkdown';
import styles from './Message.module.css';

export interface MessageProps {
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
								<ParseMarkdown key={ index }>
									{ contentBlock.text }
								</ParseMarkdown>
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
