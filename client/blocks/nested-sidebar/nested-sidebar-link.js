/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * internal dependencies
 */
import { setSidebarRoute } from 'state/sidebar/actions';

export class NestedSidebarLink extends Component {
	changeRoute = () => {
		this.props.setSidebarRoute( this.props.route );
	};

	render() {
		return <p onClick={ this.changeRoute }>{ this.props.children }</p>;
	}
}

export default connect( null, dispatch =>
	bindActionCreators(
		{
			setSidebarRoute,
		},
		dispatch
	)
)( NestedSidebarLink );
