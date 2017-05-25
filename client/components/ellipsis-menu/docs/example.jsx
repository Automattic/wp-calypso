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

export default class EllipsisMenuExample extends React.Component {
	static displayName = 'EllipsisMenuExample';

	render() {
		return (
			<EllipsisMenu position="bottom right">
				<PopoverMenuItem icon="add">Option A</PopoverMenuItem>
				<PopoverMenuItem icon="pencil">Option B</PopoverMenuItem>
				<PopoverMenuSeparator />
				<PopoverMenuItem icon="help">Option C</PopoverMenuItem>
			</EllipsisMenu>
		);
	}
}
