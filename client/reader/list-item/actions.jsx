/**
 * External dependencies
 */
import React from 'react';

const ListItemActions = React.createClass( {
	shouldComponentUpdate: function( nextProps, nextState ) {
		return React.addons.shallowCompare( this, nextProps, nextState );
	},

	render() {
		return <div className="reader-list-item__actions">{ this.props.children }</div>;
	},
} );

export default ListItemActions;
