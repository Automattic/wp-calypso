/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import VerticalNav from '../index';
import VerticalNavItem from '../item/index';

function VerticalNavExample() {
	return (
		<VerticalNav>
			<VerticalNavItem path="/stats" key="0">
				Stats
			</VerticalNavItem>
			<VerticalNavItem path="https://google.com" external key="1">
				Google
			</VerticalNavItem>
			<VerticalNavItem path="/posts" onClick={ noop } key="2">
				Posts
			</VerticalNavItem>
			<VerticalNavItem isPlaceholder key="3" />
		</VerticalNav>
	);
}

VerticalNavExample.displayName = 'VerticalNav';

export default VerticalNavExample;
