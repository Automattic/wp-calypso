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
	 * @default 2
	 */
	level?: 2 | 3;
	/**
	 * Defines whether the section header is used as a page header.
	 * If true, it will use level 1 for the heading, so there is no
	 * need to set the level prop.
	 * @default false
	 */
	isPageHeader?: boolean;
	/**
	 * Optional content to be placed above the other elements of the component.
	 */
	prefix?: React.ReactNode;
}
