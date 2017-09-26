/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

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
