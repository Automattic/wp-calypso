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
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/design/ellipsis-menu">Ellipsis Menu</a>
			</h2>
			<EllipsisMenu position="bottom right">
				<PopoverMenuItem icon="add">Option A</PopoverMenuItem>
				<PopoverMenuItem icon="pencil">Option B</PopoverMenuItem>
				<PopoverMenuSeparator />
				<PopoverMenuItem icon="help">Option C</PopoverMenuItem>
			</EllipsisMenu>
		</div>
	);
}

EllipsisMenuDemo.displayName = 'EllipsisMenu';
