/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

const ListItemActions = React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		return ( <div className="reader-list-item__actions">{ this.props.children }</div> );
	}
} );

export default ListItemActions;
