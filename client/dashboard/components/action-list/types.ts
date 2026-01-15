import React from 'react';
import type { IconListItemProps, IconListProps } from '../icon-list/types';

export interface ActionItemProps extends Omit< IconListItemProps, 'suffix' > {
	/**
	 * Renders a button that invokes the related action.
	 */
	actions: React.ReactNode;
}

export interface ActionListProps extends IconListProps {
	/**
	 * The elements, which should include one instance of the `ActionList.ActionItem`
	 * component.
	 */
	children: React.ReactNode;
}
