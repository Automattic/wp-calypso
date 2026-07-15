import React from 'react';
import { motion } from 'framer-motion';
import { __ } from '@wordpress/i18n';
import { cn } from '../../utils/classNames';
import { fastSpring } from '../animations';
import { AgentUISuggestions } from './AgentUISuggestions';
import { AgentUINotice } from './AgentUINotice';
import { AgentUIInput } from './AgentUIInput';
import styles from '../chat/ChatFooter.module.css';

const AI_GUIDELINES_URL = 'https://automattic.com/ai-guidelines/';

export interface AgentUIFooterProps {
	children?: React.ReactNode;
	className?: string;
	// AI-interaction disclosure shown below the input box (EU AI Act Art. 50(1)).
	// Defaults to a generic sentence with a guidelines link; pass `false` to
	// hide or a node to override.
	complianceDisclosure?: React.ReactNode | false;
}

export function DefaultComplianceDisclosure() {
	// Single template string so translators control word order, spacing, and
	// sentence-final punctuation.
	const template =
		/* translators: %s: the linked label "Guidelines" (links to Automattic's AI guidelines). */
		__( 'You’re chatting with AI. %s.', 'a8c-agenttic' );
	const [ before, after ] = template.split( '%s' );
	return (
		<>
			{ before }
			<a
				href={ AI_GUIDELINES_URL }
				target="_blank"
				rel="noopener noreferrer"
				aria-label={ __(
					'Guidelines (opens in a new tab)',
					'a8c-agenttic'
				) }
			>
				{ __( 'Guidelines', 'a8c-agenttic' ) }
			</a>
			{ after }
		</>
	);
}

// Wrapper for the AI-interaction disclosure rendered below a chat footer.
// Hides only on the explicit `false` sentinel or nullish values — a computed
// falsy node like `''` or `0` must not silently drop a legally required
// disclosure.
export function ComplianceDisclosure( {
	children,
}: {
	children?: React.ReactNode;
} ) {
	if ( children === false || children === null || children === undefined ) {
		return null;
	}
	return (
		<div
			data-slot="chat-compliance-disclosure"
			className={ styles.disclosure }
		>
			{ children }
		</div>
	);
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
