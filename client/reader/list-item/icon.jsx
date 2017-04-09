/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';

const genericFeedIcon = ( <SiteIcon size={ 48 } /> );

const ListItemDescription = React.createClass( {
	mixins: [ PureRenderMixin ],

	getDefaultProps() {
		return { onClick: noop };
	},

	render() {
		return ( <span className="reader-list-item__icon" onClick={ this.props.onClick }>{ this.props.children || genericFeedIcon }</span> );
	}
} );

export default ListItemDescription;
