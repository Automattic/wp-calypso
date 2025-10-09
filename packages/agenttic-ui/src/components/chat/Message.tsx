import { motion } from 'framer-motion';
import React from 'react';
import Markdown from 'react-markdown';
import type { ComponentType } from 'react';
import { __ } from '@wordpress/i18n';
import type { Message as MessageType } from '../../types';
import { cn } from '../../utils/classNames';
import { fadeVariants } from '../animations';
import { MessageActions } from './MessageActions';
import styles from './Message.module.css';

export interface MessageProps {
	message: MessageType;
	messageRenderer?: ComponentType< { children: string } >;
}

export const Message = React.forwardRef< HTMLDivElement, MessageProps >(
	function Message(
		{ message, messageRenderer: MessageRenderer = Markdown },
		ref
	) {
		const renderMessageContent = () => {
			// Ensure message.content is an array
			const messageContent = Array.isArray( message.content )
				? message.content
				: [];

			return (
				<>
					{ messageContent.map( ( contentBlock, index ) => {
						if (
							contentBlock.type === 'text' &&
							contentBlock.text
						) {
							return (
								<MessageRenderer key={ index }>
									{ contentBlock.text }
								</MessageRenderer>
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
				className={ cn(
					styles.message,
					styles[ message.role ],
					message.disabled ? styles.disabled : undefined
				) }
			>
				<div
					className={ styles.content }
					title={
						message.disabled
							? __(
									'This action is no longer available or cannot be performed',
									'a8c-agenttic'
							  )
							: undefined
					}
				>
					<div className={ styles.bubble }>
						{ renderMessageContent() }
					</div>
					{ message.role !== 'user' && (
						<MessageActions message={ message } />
					) }
				</div>
				{ message.role === 'user' && (
					<MessageActions message={ message } />
				) }
			</motion.div>
		);
	}
);
