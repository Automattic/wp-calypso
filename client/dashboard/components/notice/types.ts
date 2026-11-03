import React from 'react';
import type { Notice as UINotice } from '@wordpress/ui';

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
	children?: React.ReactNode;

	/**
	 * Optional actions that serve as a call to action.
	 */
	actions?: React.ReactNode;

	/**
	 * Custom icon to use instead of the default one for each variant, or `null` to hide it.
	 */
	icon?: React.ComponentProps< typeof UINotice.Root >[ 'icon' ];

	/**
	 * An optional action to close the component.
	 */
	onClose?: () => void;
}
