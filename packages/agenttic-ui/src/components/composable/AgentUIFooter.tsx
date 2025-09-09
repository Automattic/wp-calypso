import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/classNames';
import { fastSpring } from '../animations';
import { AgentUISuggestions } from './AgentUISuggestions';
import { AgentUINotice } from './AgentUINotice';
import { AgentUIInput } from './AgentUIInput';
import styles from '../chat/ChatFooter.module.css';

export interface AgentUIFooterProps {
	children?: React.ReactNode;
	className?: string;
}

export function AgentUIFooter( {
	children,
	className,
}: AgentUIFooterProps = {} ) {
	if ( children ) {
		return (
			<motion.div
				data-slot="chat-footer"
				className={ cn( styles.container, className ) }
				initial={ { opacity: 0, scale: 1 } }
				animate={ { opacity: 1, scale: 1 } }
				transition={ { ...fastSpring } }
			>
				{ children }
			</motion.div>
		);
	}

	// Default composition - matches current ChatFooter
	return (
		<motion.div
			data-slot="chat-footer"
			className={ cn( styles.container, className ) }
			initial={ { opacity: 0, scale: 1 } }
			animate={ { opacity: 1, scale: 1 } }
			transition={ { ...fastSpring } }
		>
			<AgentUISuggestions />
			<AgentUINotice />
			<AgentUIInput />
		</motion.div>
	);
}
