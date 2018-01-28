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
import Transitioner from './transition';

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
						<NestedSidebarLink route={ parentRoute } direction="left">Back</NestedSidebarLink>
					) : (
						<p>No Parent Route</p>
					) }
					<div className="nested-sidebar__content-container">
						{ SidebarComponent && false && <SidebarComponent /> }
						{  (
							<Transitioner
								direction={ transitionDirection }
								Comp={ SidebarComponent }
								Tcomp={ TransitioningComponent }

							>
								{ SidebarComponent && <SidebarComponent /> }
								{ SidebarComponent && false && <SidebarComponent /> }
								{ TransitioningComponent && false && <TransitioningComponent /> }
							</Transitioner>
						) }
					</div>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		route: get( state, 'sidebar.route' ),
		transition: get( state, 'sidebar.transition' ) || {},
	} )
)( NestedSidebar );
