/**
 * External dependencies
 */
import React from 'react';

class ListItemDescription extends React.PureComponent {
	render() {
		// should this be a div instead of a p? p's have odd nesting rules that we can't enforce in code.
		return (
			<p className="reader-list-item__description">
				{ this.props.children }
			</p>
		);
	}
}

export default ListItemDescription;
