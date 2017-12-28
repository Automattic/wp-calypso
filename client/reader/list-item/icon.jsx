/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import SiteIcon from 'client/blocks/site-icon';

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
