/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EllipsisMenu from '../';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';

export default function EllipsisMenuDemo() {
	return (
		<EllipsisMenu position="bottom right">
			<PopoverMenuItem icon="add">Option A</PopoverMenuItem>
			<PopoverMenuItem icon="pencil">Option B</PopoverMenuItem>
			<PopoverMenuSeparator />
			<PopoverMenuItem icon="help">Option C</PopoverMenuItem>
		</EllipsisMenu>
	);
}

EllipsisMenuDemo.displayName = 'EllipsisMenu';
