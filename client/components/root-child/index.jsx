/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'RootChild',

	componentDidMount: function() {
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		this.renderChildren();
	},

	componentDidUpdate: function() {
		this.renderChildren();
	},

	componentWillUnmount: function() {
		if ( ! this.container ) {
			return;
		}

		ReactDom.unmountComponentAtNode( this.container );
		document.body.removeChild( this.container );
		delete this.container;
	},

	renderChildren: function() {
		var content;

		if ( this.props &&
			( Object.keys( this.props ).length > 1 || ! this.props.children )
		) {
			content = <div { ...this.props }>{ this.props.children }</div>;
		} else {
			content = this.props.children;
		}

		ReactDom.render( content, this.container );
	},

	render: function() {
		return null;
	}
} );
