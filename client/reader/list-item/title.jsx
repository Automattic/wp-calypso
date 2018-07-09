/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

class ListItemTitle extends React.PureComponent {
	static defaultProps = { onClick: noop };

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
		return (
			<h2 className="reader-list-item__title" onClick={ this.props.onClick }>
				{ this.props.children }
			</h2>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
	}
}

export default ListItemTitle;
