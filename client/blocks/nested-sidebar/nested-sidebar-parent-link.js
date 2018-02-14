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
import NestedSidebarItem from './nested-sidebar-item';
import { getRouteData } from './docs/access';

export class NestedSidebarParentLink extends Component {
	static defaultProps = {
		label: 'Back', // translate...
		icon: 'arrow-left',
	};

	render() {
		const { route } = this.props;
		const { parent } = getRouteData( route );

		return (
			<NestedSidebarItem
				{ ...this.props }
				route={ parent }
			/>
		);
	}
}

export default connect( ( state, { route } ) => ( {
	route: route || get( state, 'sidebar.route' ),
} ) )( NestedSidebarParentLink );
