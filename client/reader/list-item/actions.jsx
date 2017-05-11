/**
 * External dependencies
 */
import React from 'react';

class ListItemActions extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
		return React.addons.shallowCompare( this, nextProps, nextState );
	}

    render() {
		return <div className="reader-list-item__actions">{ this.props.children }</div>;
	}
}

export default ListItemActions;
