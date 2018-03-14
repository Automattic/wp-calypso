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

	state = {
		shouldRenderChild: false,
	};

	onClick = () => {
		if ( !! this.props.children ) {
			this.setState( {
				shouldRenderChild: ! this.state.shouldRenderChild,
			} );
		}
	};

	render() {
		const showChild = this.props.children && ! this.state.shouldRenderChild;

		return (
			<div>
				<span
					onClick={ showChild ? this.onClick : null }
					style={ { color: showChild ? 'green' : 'black' } }
				>
					{ this.props.text }
					{ this.state.shouldRenderChild && this.props.children }
				</span>
			</div>
		);
	}
}

export default NestedSidebarLink;

// export default connect(
// 	state => ( {
// 		parentRoute: get( state, 'sidebar.parentRoute' ),
// 	} ),
// 	dispatch =>
// 		bindActionCreators(
// 			{
// 				setSidebarRoute,
// 				startSidebarTransition,
// 				endSidebarTransition,
// 			},
// 			dispatch
// 		)
// )( NestedSidebarLink );
