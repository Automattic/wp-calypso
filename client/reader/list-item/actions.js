/**
 * External dependencies
 */
import React from 'react';

class ListItemActions extends React.PureComponent {
	render() {
		return (
			<div className="reader-list-item__actions">
				{ this.props.children }
			</div>
		);
	}
}

export default ListItemActions;
