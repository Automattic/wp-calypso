/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get, invoke } from 'lodash';

/**
 * internal dependencies
 */
import {
	setSidebarRoute,
	startSidebarTransition,
	endSidebarTransition,
} from 'state/sidebar/actions';
import SidebarItem from 'layout/sidebar/item';
import { setRouteData } from './docs/access';

// NestedSidebarLink's main responsibility is to act like an anchor tag
// but for navigating through sidebar routes, it should be able to render any child
// as an anchor tag would (It may be that an a tag makes sense in place of the p tag).
export class NestedSidebarLink extends Component {
	static defaultProps = {
		parent: 'root',
		icon: 'ellipsis',
	};

	static propTypes = {
		component: PropTypes.func,
		route: PropTypes.string.isRequired,
		parent: PropTypes.string,
	};

	componentWillMount() {
		const {
			route,
			parent,
			component,
		} = this.props;

		if ( component ) {
			setRouteData( route, { parent, component } );
		}
	}

	changeRoute = e => {
		this.props.setSidebarRoute( this.props.route );
		invoke( e, 'preventDefault' );
	};

	render() {
		return (
			<SidebarItem
				{ ...this.props }
				onNavigate={ this.changeRoute }
			/>
		);
	}
}

export default connect(
	null,
	{ setSidebarRoute }
)( NestedSidebarLink );
