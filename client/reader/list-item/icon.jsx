/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';

const genericFeedIcon = <SiteIcon size={ 48 } />;

class ListItemDescription extends React.Component {
    static defaultProps = { onClick: noop };

    shouldComponentUpdate(nextProps, nextState) {
		return React.addons.shallowCompare( this, nextProps, nextState );
	}

    render() {
		return (
			<span className="reader-list-item__icon" onClick={ this.props.onClick }>
				{ this.props.children || genericFeedIcon }
			</span>
		);
	}
}

export default ListItemDescription;
