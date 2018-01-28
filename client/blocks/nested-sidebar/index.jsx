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
import Transitioner from 'components/transitioner';

export class NestedSidebar extends Component {
	render() {
		const { route, transition } = this.props;

		const transitioningRoute = get( transition, 'route' );
		const transitionDirection = get( transition, 'direction' );

		const TransitioningComponent = transitioningRoute && getRouteComponent( transitioningRoute );
		const SidebarComponent = getRouteComponent( route );
		const parentRoute = getRouteData( route ).parent;

		return (
			<div>
				<div style={ { border: '1px solid black', padding: '10px 15px' } }>
					{ parentRoute ? (
						<NestedSidebarLink route={ parentRoute } direction="left">
							Back
						</NestedSidebarLink>
					) : (
						<p>No Parent Route</p>
					) }
					<div className="nested-sidebar__content-container">
						{
							<Transitioner
								direction={ transitionDirection }
								Comp={ SidebarComponent }
								IncomingComponent={ TransitioningComponent }
							>
								{ SidebarComponent && (
									<SidebarComponent style={ { background: 'rgba(190,0,0,0.1)' } } />
								) }
							</Transitioner>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default connect( state => ( {
	route: get( state, 'sidebar.route' ),
	transition: get( state, 'sidebar.transition' ) || {},
} ) )( NestedSidebar );
