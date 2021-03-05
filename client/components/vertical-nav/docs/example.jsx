/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import VerticalNav from '../index';
import VerticalNavItem from '../item/index';

const noop = () => {};

VerticalNav.displayName = 'VerticalNav';
VerticalNavItem.displayName = 'VerticalNavItem';
VerticalNavExample.displayName = 'VerticalNav';

function VerticalNavExample( props ) {
	return props.exampleCode;
}

VerticalNavExample.defaultProps = {
	exampleCode: (
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
	),
};

export default VerticalNavExample;
