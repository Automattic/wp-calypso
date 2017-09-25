/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';

const genericFeedIcon = <SiteIcon size={ 48 } />;

class ListItemDescription extends React.PureComponent {
	static defaultProps = { onClick: noop };

	render() {
		return (
			<span className="reader-list-item__icon" onClick={ this.props.onClick }>
				{ this.props.children || genericFeedIcon }
			</span>
		);
	}
}

export default ListItemDescription;
