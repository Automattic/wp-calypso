import React from 'react';
import type { IconListItemProps, IconListProps, ItemLayout } from '../icon-list/types';

export interface ActionItemProps extends Omit< IconListItemProps, 'suffix' | 'density' > {
	/**
	 * Renders a button that invokes the related action.
	 */
	actions: React.ReactNode;

	/**
	 * Controls the layout of the actions relative to content.
	 * - 'inline': Actions appear horizontally next to content (default)
	 * - 'stacked': Actions appear below content in a vertical stack
	 * @default 'inline'
	 */
	layout?: ItemLayout;
}

export interface ActionListProps extends IconListProps {
	/**
	 * The elements, which should include one instance of the `ActionList.ActionItem`
	 * component.
	 */
	children: React.ReactNode;
}
