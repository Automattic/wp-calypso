import type { Icon } from '@wordpress/components';
import type { ComponentProps, ReactNode } from 'react';

export interface CalloutProps {
	/**
	 * A concise headline that clearly communicates the main message or feature being highlighted.
	 */
	title: string;
	/**
	 * The type of element to use for the title. Allows for the title can a heading element.
	 * @default <Text>
	 */
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
	/**
	 * A short paragraph providing supporting context or details to reinforce the title.
	 * Elements will be arranged in a VStack with consistent spacing.
	 */
	description: ReactNode;
	/**
	 * Callout's style variant.
	 * - default: Display the Callout in a card.
	 * - highlight: Gives additional prominence to the Callout by increasing the heading size, adjusting some colors, and utilizing a primary button for the cta.
	 * @default 'default'
	 */
	variant?: 'default' | 'highlight';
	/**
	 * An optional small graphic used to visually reinforce the message or category of the Callout.
	 */
	icon?: ComponentProps< typeof Icon >[ 'icon' ];
	/**
	 * An optional larger visual or graphic that enhances the Callout’s impact and draws attention.
	 */
	image?: string | ReactNode;
	/**
	 * Alt text to accompany the image.
	 */
	imageAlt?: string;
	/**
	 * Image style variant.
	 * - default: Display the image within the container's default padding.
	 * - full-bleed: Display the image covering the full height of the container.
	 * @default 'default'
	 */
	imageVariant?: 'default' | 'full-bleed';
	/**
	 * Typically a single button serving as a call to action.
	 * Elements will be arranged in a VStack with consistent spacing.
	 */
	actions?: ReactNode;
}
