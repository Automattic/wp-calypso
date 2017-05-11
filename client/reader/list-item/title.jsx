/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

const ListItemTitle = React.createClass( {
	getDefaultProps() {
		return { onClick: noop };
	},

	shouldComponentUpdate: function( nextProps, nextState ) {
		return React.addons.shallowCompare( this, nextProps, nextState );
	},

	render() {
		return (
			<h2 className="reader-list-item__title" onClick={ this.props.onClick }>
				{ this.props.children }
			</h2>
		);
	},
} );

export default ListItemTitle;
