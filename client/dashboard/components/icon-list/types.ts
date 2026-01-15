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
	 * Optional CSS class name(s) to apply to the item.
	 */
	className?: string;
	/**
	 * Controls the overall visual density of the item, including spacing
	 * between the decoration/icon and the content, as well as the spacing
	 * between the title and description text. When set to `'low'`, it also
	 * adjusts the title typography (e.g., a smaller title font size) to
	 * match the denser layout.
	 * @default 'medium'
	 */
	density?: 'low' | 'medium' | 'high';
}

export interface IconListProps {
	/**
	 * The main label that identifies the list.
	 */
	title?: string;
	/**
	 * Optional supporting text that provides additional context or
	 * detail about the list.
	 */
	description?: string;
	/**
	 * The elements, which should include one instance of the `IconList.Item`
	 * component.
	 */
	children: React.ReactNode;
}
