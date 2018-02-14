/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRouteComponent } from './docs/access';

const NestedSidebar = ( { route } ) => {
	const SidebarComponent = getRouteComponent( route );

	if ( ! SidebarComponent ) {
		return null;
	}

	return (
		<div className="nested-sidebar">
			<SidebarComponent />
		</div>
	);
}

export default connect( state => ( {
	// @TODO: Create/Use proper selectors for these.
	route: get( state, 'sidebar.route' ),
} ) )( NestedSidebar );
