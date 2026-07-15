import React from 'react';
import { __ } from '@wordpress/i18n';
import styles from './ComplianceDisclosure.module.css';

// Rendered by both build entries — keep this module a leaf. Anything imported
// here becomes shared between the entries, and Vite moves shared modules' CSS
// out of `index.css` into a chunk stylesheet.

const AI_GUIDELINES_URL = 'https://automattic.com/ai-guidelines/';

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
