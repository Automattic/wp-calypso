import React from 'react/addons';
import noop from 'lodash/utility/noop';

const ListItemTitle = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	getDefaultProps() {
		return { onClick: noop };
	},

	render() {
		return ( <h2 className="reader-list-item__title" onClick={ this.props.onClick }>{ this.props.children }</h2> );
	}
} );

export default ListItemTitle;
