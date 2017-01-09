/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Item from './item';

export default React.createClass( {
	displayName: 'MasterbarStats',

	propTypes: {
		children: React.PropTypes.node,
	},

	render() {
		return (
			<Item { ...this.props } >
				{ this.props.children }
			</Item>
		);
	}
} );
