import React from 'react/addons';

const ListItemActions = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	render() {
		return ( <div className="reader-list-item__actions">{ this.props.children }</div> );
	}
} );

export default ListItemActions;
