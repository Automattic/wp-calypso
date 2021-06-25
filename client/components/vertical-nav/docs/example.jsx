/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import VerticalNavItemEnhanced from 'calypso/components/vertical-nav/item/enhanced';

const noop = () => {};

VerticalNav.displayName = 'VerticalNav';
VerticalNavItem.displayName = 'VerticalNavItem';
VerticalNavItemEnhanced.displayName = 'VerticalNavItemEnhanced';
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

			<VerticalNavItemEnhanced
				description="Access your emails on the go with our Android and iOS apps"
				external
				key="4"
				materialIcon="smartphone"
				path="https://wp.com/app"
				text="Get mobile app"
			/>

			<VerticalNavItemEnhanced
				description="https://wordpress.com"
				gridicon="my-sites"
				key="5"
				path="https://wordpress.com"
				text="Create new site"
			/>
		</VerticalNav>
	),
};

export default VerticalNavExample;
