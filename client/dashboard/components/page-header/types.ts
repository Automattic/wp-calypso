import React from 'react';
import type { BreadcrumbItemProps } from '@automattic/components/src/breadcrumbs/types';

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
	actions?: React.ReactNode[];
	/**
	 * An optional visual element like an icon or small illustration
	 * to enhance recognition or provide visual interest.
	 */
	decoration?: React.ReactNode;
	/**
	 * An optional breadcrumb trail used to indicate the user's current position
	 * in a complex navigational structure and allow quick access to parent levels.
	 * Internally it uses the `Breadcrumbs` component.
	 */
	breadcrumbs?: BreadcrumbItemProps[];
}
