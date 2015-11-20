import React from 'react/addons';
import noop from 'lodash/utility/noop';

import SiteIcon from 'components/site-icon';

const genericFeedIcon = ( <SiteIcon size={ 48 } /> );

const ListItemDescription = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	getDefaultProps() {
		return { onClick: noop };
	},

	render() {
		return ( <span className="reader-list-item__icon" onClick={ this.props.onClick }>{ this.props.children || genericFeedIcon }</span> );
	}
} );

export default ListItemDescription;
