import React from 'react';
import type { IconType } from '@wordpress/components';

type NoticeDensity = 'low' | 'medium' | 'high';

export type NoticeVariant = 'warning' | 'success' | 'error' | 'info';

export interface NoticeProps {
	/**
	 * Indicates visually the message tone. These can be four: Info, Warning, Success, and Error.
	 * @default 'info'
	 */
	variant?: NoticeVariant;

	/**
	 * A concise headline that clearly communicates the main message.
	 */
	title?: React.ReactNode;

	/**
	 * The main body content informing and guiding users about the system status change.
	 */
	children: React.ReactNode;

	/**
	 * Optional actions that serve as a call to action.
	 */
	actions?: React.ReactNode;

	/**
	 * Adjusts internal spacings according to the section where the component is placed.
	 * High density reduces padding.
	 * @default 'low'
	 */
	density?: NoticeDensity;

	/**
	 * Custom icon to use instead of the default one for each variant.
	 */
	icon?: IconType;

	/**
	 * An optional action to close the component.
	 */
	onClose?: () => void;

	/**
	 * ARIA role - tells screen readers what type of content this is.
	 * Use 'status' for non-critical updates, 'alert' for critical messages.
	 */
	role?: 'status' | 'alert';

	/**
	 * ARIA live region behavior -  tells screen readers how to announce the content.
	 * 'polite' waits for screen reader to be idle, 'assertive' interrupts immediately.
	 */
	'aria-live'?: 'polite' | 'assertive';
}
