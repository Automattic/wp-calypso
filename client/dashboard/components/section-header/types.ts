import React from 'react';

export interface SectionHeaderProps {
	/**
	 * The main heading text that identifies the page or section.
	 */
	title: string;
	/**
	 * Optional supporting text that provides additional context or
	 * guidance beneath the title.
	 */
	description?: React.ReactNode;
	/**
	 * A group of contextual controls, such as buttons, dropdowns,
	 * or a search input, relevant to the page or section.
	 */
	actions?: React.ReactNode;
	/**
	 * An optional visual element like an icon or small illustration
	 * to enhance recognition or provide visual interest.
	 */
	decoration?: React.ReactNode;
	/**
	 * Defines heading level and affects the appearance of the heading text.
	 * _Note: use `1` only for page headers._
	 * @default 2
	 */
	level?: 1 | 2 | 3;
	/**
	 * Unique identifier for the rendered heading element, useful for linking
	 * or accessibility purposes.
	 */
	headingId?: string;
	/**
	 * Optional content to be placed above the other elements of the component.
	 */
	prefix?: React.ReactNode;
	/**
	 * Optional class name to be applied to the component.
	 */
	className?: string;
}
