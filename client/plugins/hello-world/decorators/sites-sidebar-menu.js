/**
 * External dependencies
 */
import React from 'react';
import { concat, get } from 'lodash';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import { addSiteFragment } from 'lib/route/path';

export default function HelloWorldDecorator( Base ) {
	return class extends React.Component {
		render() {
			const slug = get( this.props, 'selectedSite.slug', '' );
			const children = concat( this.props.extraChildren,
				<SidebarItem
					key="hello-world"
					icon="status"
					label="Hello, World!"
					onNavigate={ this.props.onNavigate }
					link={ addSiteFragment( '/hello-world', slug ) } />
			);
			return <Base { ...this.props } extraChildren={ children } />;
		}
	};
}
