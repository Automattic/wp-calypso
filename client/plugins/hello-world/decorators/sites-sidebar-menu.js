/**
 * External dependencies
 */
import React from 'react';
import { concat } from 'lodash';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';

export default function HelloWorldDecorator( Base ) {
	return class extends React.Component {
		render() {
			const children = concat( this.props.extraChildren,
				<SidebarItem
					key="hello-world"
					icon="status"
					label="Hello, World!"
					link="/hello-world" />
			);
			return <Base { ...this.props } extraChildren={ children } />;
		}
	};
}
