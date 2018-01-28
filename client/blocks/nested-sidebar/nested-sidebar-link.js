/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get } from 'lodash';

/**
 * internal dependencies
 */
import {
	setSidebarRoute,
	startSidebarTransition,
	endSidebarTransition,
} from 'state/sidebar/actions';

export class NestedSidebarLink extends Component {
	static defaultProps = {
		direction: 'right',
	};

	changeRoute = () => {
		this.props.startSidebarTransition( this.props.route, this.props.direction );

		setTimeout( () => {
			// const newRoute = get( this.props, 'sidebar.transition.route' );

			this.props.endSidebarTransition();
			// newRoute && this.props.setSidebarRoute( this.props.route )
			this.props.setSidebarRoute( this.props.route );
		}, 1200 );
	};

	render() {
		return <p onClick={ this.changeRoute }>{ this.props.children }</p>;
	}
}

export default connect(
	state => ( {
		parentRoute: get( state, 'sidebar.parentRoute' ),
		// route: get( state, 'sidebar.route' ),
		// transition: get( state, 'sidebar.transition' ) || {},
	} ),
	dispatch =>
		bindActionCreators(
			{
				setSidebarRoute,
				startSidebarTransition,
				endSidebarTransition,
			},
			dispatch
		)
)( NestedSidebarLink );
