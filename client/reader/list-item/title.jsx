/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

class ListItemTitle extends React.PureComponent {
	static defaultProps = { onClick: noop };

	render() {
		return (
			<h2 className="reader-list-item__title" onClick={ this.props.onClick }>
				{ this.props.children }
			</h2>
		);
	}
}

export default ListItemTitle;
