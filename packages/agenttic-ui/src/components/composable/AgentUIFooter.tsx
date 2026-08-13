import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/classNames';
import { fastSpring } from '../animations';
import { AgentUISuggestions } from './AgentUISuggestions';
import { AgentUINotice } from './AgentUINotice';
import { AgentUIInput } from './AgentUIInput';
import {
	ComplianceDisclosure,
	DefaultComplianceDisclosure,
} from '../chat/ComplianceDisclosure';
import styles from '../chat/ChatFooter.module.css';

export interface AgentUIFooterProps {
	children?: React.ReactNode;
	className?: string;
	// AI-interaction disclosure shown below the input box (EU AI Act Art. 50(1)).
	// Defaults to a generic sentence with a guidelines link; pass `false` to
	// hide or a node to override.
	complianceDisclosure?: React.ReactNode | false;
}

export function AgentUIFooter( {
	children,
	className,
	complianceDisclosure = <DefaultComplianceDisclosure />,
}: AgentUIFooterProps = {} ) {
	const disclosure = (
		<ComplianceDisclosure>{ complianceDisclosure }</ComplianceDisclosure>
	);

	if ( children ) {
		return (
			<>
				<motion.div
					data-slot="chat-footer"
					className={ cn( styles.container, className ) }
					initial={ { opacity: 0, scale: 1 } }
					animate={ { opacity: 1, scale: 1 } }
					transition={ { ...fastSpring } }
				>
					{ children }
				</motion.div>
				{ disclosure }
			</>
		);
	}

	// Default composition - matches current ChatFooter
	return (
		<>
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
			{ disclosure }
		</>
	);
}
