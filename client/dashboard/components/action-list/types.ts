import React from 'react';

export interface ActionItemProps {
	/**
	 * The main label that identifies the action.
	 */
	title: string;
	/**
	 * Optional supporting text that provides additional context or
	 * detail about the action.
	 */
	description?: string;
	/**
	 * An optional visual element such as an icon or small illustration
	 * to enhance recognition or provide visual interest.
	 */
	decoration?: React.ReactNode;
	/**
	 * A group of contextual controls, such as buttons, dropdowns,
	 * or a search input, relevant to the action.
	 */
	actions: React.ReactNode;
}

export interface ActionListProps {
	/**
	 * The main label that identifies the action list.
	 */
	title?: string;
	/**
	 * Optional supporting text that provides additional context or
	 * detail about the action list.
	 */
	description?: string;
	/**
	 * The elements, which should include one instance of the `ActionList.ActionItem`
	 * component.
	 */
	children: React.ReactNode;
}
