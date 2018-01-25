/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * internal dependencies
 */
import { getRouteData, getRouteComponent } from './docs/access';
import NestedSidebarLink from './nested-sidebar-link';

export class NestedSidebar extends Component {
	render() {
		const { route } = this.props;

		const SidebarComponent = getRouteComponent( route );
		const parentRoute = getRouteData( route ).parent;

		return (
			<div>
				<div style={ { border: '1px solid black', padding: '10px 15px' } }>
					{ parentRoute ? (
						<NestedSidebarLink route={ parentRoute }>Back</NestedSidebarLink>
					) : (
						<p>No Parent Route</p>
					) }
					{ SidebarComponent && <SidebarComponent /> }
				</div>
			</div>
		);
	}
}

export default connect( state => ( {
	route: get( state, 'sidebar.route' ) || 'settings',
} ) )( NestedSidebar );
