import React from 'react';

export interface PageHeaderProps {
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
	 * An optional breadcrumbs component used to indicate the user's current position
	 * in a complex navigational structure and allow quick access to parent levels.
	 */
	breadcrumbs?: React.ReactNode;
}
