import React from 'react';

export interface IconListItemProps {
	/**
	 * The main label that identifies the item.
	 */
	title: string;
	/**
	 * Optional supporting text that provides additional context or
	 * detail about the item.
	 */
	description?: string;
	/**
	 * An optional visual element such as an icon or small illustration
	 * to enhance recognition or provide visual interest.
	 */
	decoration?: React.ReactNode;
	/**
	 * Optional content to display at the end of the item (e.g., actions, badges).
	 */
	suffix?: React.ReactNode;
	/**
	 * Visual density variant that controls the emphasis and styling of the item.
	 * - 'default': Standard appearance without icon border or sizing constraints (default)
	 * - 'prominent': Enhanced appearance with icon border, fixed sizing, and centering
	 */
	variant?: 'default' | 'prominent';
	/**
	 * Vertical alignment of the decoration relative to the text content.
	 * - 'top': Align decoration to the top of the text
	 * - 'center': Align decoration to the middle of the text (default)
	 * - 'bottom': Align decoration to the bottom of the text
	 */
	alignment?: 'top' | 'center' | 'bottom';
	/**
	 * Optional CSS class name(s) to apply to the item.
	 */
	className?: string;
}

export interface IconListProps {
	/**
	 * The elements, which should include one instance of the `IconList.Item`
	 * component.
	 */
	children: React.ReactNode;
}
