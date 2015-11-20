import React from 'react/addons';

const ListItemDescription = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	render() {
		// should this be a div instead of a p? p's have odd nesting rules that we can't enforce in code.
		return ( <p className="reader-list-item__description">{ this.props.children }</p> );
	}
} );

export default ListItemDescription;
